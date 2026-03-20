export interface SessionAttendance {
  eventId: any;
  agendaId: any;
  sessionId: any;
  memberId: any;
  userId: string;
  status: 'registered' | 'attended';
  createdAt?: Date;
  updatedAt?: Date;
}
