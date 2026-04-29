import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseDto } from 'src/common/response.dto';

type AttendanceMember = {
  _id: any
  properties?: {
    email?: string
    name?: string
    names?: string
    fullName?: string
    [key: string]: any
  }
  [key: string]: any
}

type SessionAttendanceDoc = {
  _id: any
  eventId: any
  agendaId: any
  sessionId: any
  memberId: any
  userId: string
  status: 'registered' | 'attended'
  createdAt?: Date
  updatedAt?: Date
}

type AgendaSession = {
  _id: any
  title: string
  titleEn?: string
  startDateTime?: string | Date
  endDateTime?: string | Date
  room?: string
  roomEn?: string
  typeSession?: string
  typeSessionEn?: string
  requiresAttendance?: boolean
  [key: string]: any
}

@Injectable()
export class AdminAttendanceRequiredService {
  constructor(
    @InjectModel('Agenda') private readonly agendaModel: Model<any>,
    @InjectModel('SessionAttendance') private readonly attendanceModel: Model<SessionAttendanceDoc>,
    @InjectModel('Member') private readonly memberModel: Model<AttendanceMember>,
  ) {}

  private toObjectId(id: string) {
    return new Types.ObjectId(id)
  }

  private normalizeMember(member?: AttendanceMember | null) {
    if (!member) return null
    return {
      ...member,
      properties: member.properties ?? {},
    }
  }

  async findByEvent(eventId: string) {
    const agendas = await this.agendaModel
      .find({ eventId: this.toObjectId(eventId) })
      .sort({ createdAt: 1 })
      .lean()

    const requiredSessions = agendas.flatMap((agenda: { _id: any; sessions?: AgendaSession[] }) =>
      (agenda.sessions ?? [])
        .filter((session) => session.requiresAttendance)
        .map((session) => ({
          agendaId: String(agenda._id),
          session,
        })),
    )

    if (requiredSessions.length === 0) {
      return new ResponseDto('success', 'Sesiones con asistencia requerida', { items: [], total: 0 })
    }

    const sessionIds = requiredSessions.map(({ session }) => this.toObjectId(String(session._id)))

    const attendanceRecords = await this.attendanceModel
      .find({
        eventId: this.toObjectId(eventId),
        sessionId: { $in: sessionIds },
      })
      .lean()

    const memberIds = [...new Set(
      attendanceRecords
        .map((record) => String(record.memberId))
        .filter(Boolean),
    )].map((id) => this.toObjectId(id))

    const members = memberIds.length > 0
      ? await this.memberModel.find({ _id: { $in: memberIds } }).lean()
      : []

    const membersById = new Map<string, AttendanceMember>()
    members.forEach((member) => {
      membersById.set(String(member._id), this.normalizeMember(member))
    })

    const attendanceBySessionId = new Map<string, any[]>()
    attendanceRecords.forEach((record) => {
      const key = String(record.sessionId)
      const current = attendanceBySessionId.get(key) ?? []
      current.push({
        ...record,
        memberId: membersById.get(String(record.memberId)) ?? record.memberId,
      })
      attendanceBySessionId.set(key, current)
    })

    const items = agendas
      .map((agenda: { _id: any; sessions?: AgendaSession[] }) => {
        const sessions = (agenda.sessions ?? [])
          .filter((session) => session.requiresAttendance)
          .map((session) => ({
            ...session,
            attendees: attendanceBySessionId.get(String(session._id)) ?? [],
          }))
          .sort((a, b) => {
            const left = a.startDateTime ? new Date(a.startDateTime).getTime() : 0
            const right = b.startDateTime ? new Date(b.startDateTime).getTime() : 0
            return left - right
          })

        return {
          _id: agenda._id,
          sessions,
        }
      })
      .filter((agenda) => agenda.sessions.length > 0)

    return new ResponseDto('success', 'Sesiones con asistencia requerida', {
      items,
      total: items.reduce((acc, agenda) => acc + agenda.sessions.length, 0),
    })
  }
}