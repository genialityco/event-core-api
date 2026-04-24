import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseDto } from 'src/common/response.dto';

@Controller('admin/organizations/:orgId/pre-registered')
export class AdminPreRegistrationController {
  constructor(
    @InjectModel('PreRegisteredAttendee')
    private readonly preRegModel: Model<any>,
    @InjectModel('Organization')
    private readonly orgModel: Model<any>,
  ) {}

  private pickTrimmed(input: Record<string, any>, keys: string[]) {
    for (const key of keys) {
      const value = input?.[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return undefined;
  }

  private normalizeExtraFields(input: Record<string, any>) {
    return {
      name: this.pickTrimmed(input, ['name', 'nombre']),
      channel: this.pickTrimmed(input, [
        'channel',
        'canal',
        'organization',
        'organizacion',
      ]),
      position: this.pickTrimmed(input, ['position', 'cargo']),
      observations: this.pickTrimmed(input, ['observations', 'observaciones']),
      country: this.pickTrimmed(input, ['country', 'pais']),
    };
  }

  /** GET — lista todos los correos pre-registrados de la org */
  @Get()
  async findAll(
    @Param('orgId') orgId: string,
    @Query('eventId') eventId?: string,
  ) {
    const filter: any = { organizationId: new Types.ObjectId(orgId) };
    if (eventId) filter.eventId = new Types.ObjectId(eventId);

    const items = await this.preRegModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return new ResponseDto('success', 'Pre-registros encontrados', {
      items,
      total: items.length,
    });
  }

  /** POST — agrega un correo individual */
  @Post()
  async addOne(
    @Param('orgId') orgId: string,
    @Body() body: { email: string; name?: string; channel?: string; position?: string; observations?: string; country?: string; eventId?: string },
  ) {
    if (!body.email) throw new BadRequestException('El correo es requerido.');

    const email = body.email.toLowerCase().trim();
    const orgObjectId = new Types.ObjectId(orgId);
    const normalized = this.normalizeExtraFields(body as any);
    const setPayload: any = {};

    if (normalized.name) setPayload.name = normalized.name;
    if (normalized.channel) setPayload.channel = normalized.channel;
    if (normalized.position) setPayload.position = normalized.position;
    if (normalized.observations) setPayload.observations = normalized.observations;
    if (normalized.country) setPayload.country = normalized.country;
    if (body.eventId) setPayload.eventId = new Types.ObjectId(body.eventId);

    try {
      const result = await this.preRegModel.findOneAndUpdate(
        { email, organizationId: orgObjectId },
        {
          $set: setPayload,
          $setOnInsert: {
            email,
            organizationId: orgObjectId,
            isActivated: false,
            activatedAt: null,
            activatedByUserId: null,
          },
        },
        {
          upsert: true,
          new: true,
          rawResult: true,
          setDefaultsOnInsert: true,
        },
      );

      const wasCreated = !result?.lastErrorObject?.updatedExisting;
      return new ResponseDto(
        'success',
        wasCreated ? 'Correo pre-registrado' : 'Correo pre-registrado actualizado',
        result?.value,
      );
    } catch (err: any) {
      throw err;
    }
  }

  /** POST /bulk — importación masiva de correos */
  @Post('bulk')
  async bulkImport(
    @Param('orgId') orgId: string,
    @Body()
    body: { emails: Array<{ email: string; name?: string; channel?: string; position?: string; observations?: string; country?: string }>; eventId?: string },
  ) {
    if (!body.emails?.length) {
      throw new BadRequestException('Se requiere al menos un correo.');
    }

    const orgObjectId = new Types.ObjectId(orgId);
    const eventObjectId = body.eventId ? new Types.ObjectId(body.eventId) : null;

    const ops = body.emails.map((raw) => {
      const normalized = this.normalizeExtraFields(raw as any);
      const email = String((raw as any)?.email ?? '').toLowerCase().trim();

      const setPayload: any = {
        name: normalized.name ?? null,
        channel: normalized.channel ?? null,
        position: normalized.position ?? null,
        observations: normalized.observations ?? null,
        country: normalized.country ?? null,
      };

      if (eventObjectId) {
        setPayload.eventId = eventObjectId;
      }

      return {
        updateOne: {
          filter: { email: email.toLowerCase().trim(), organizationId: orgObjectId },
          update: {
            $set: setPayload,
            $setOnInsert: {
              email,
              organizationId: orgObjectId,
              isActivated: false,
              activatedAt: null,
              activatedByUserId: null,
            },
          },
          upsert: true,
        },
      };
    });

    const result = await this.preRegModel.bulkWrite(ops);
    const inserted = result.upsertedCount ?? 0;
    const updated = result.modifiedCount ?? 0;
    const skipped = body.emails.length - inserted - updated;

    return new ResponseDto('success', `${inserted} correos importados, ${updated} actualizados, ${skipped} sin cambios.`, {
      inserted,
      updated,
      skipped,
    });
  }

  /** DELETE /:id — elimina un pre-registro */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.preRegModel.findByIdAndDelete(id);
    return new ResponseDto('success', 'Pre-registro eliminado', null);
  }

  /** PATCH /toggle — activa/desactiva la validación de pre-registro en la org */
  @Patch('toggle')
  async toggleRequirement(
    @Param('orgId') orgId: string,
    @Body() body: { requirePreRegistration: boolean },
  ) {
    const org = await this.orgModel.findByIdAndUpdate(
      orgId,
      { $set: { 'auth.requirePreRegistration': body.requirePreRegistration } },
      { new: true },
    );
    return new ResponseDto(
      'success',
      `Validación de pre-registro ${body.requirePreRegistration ? 'activada' : 'desactivada'}`,
      { requirePreRegistration: org?.auth?.requirePreRegistration },
    );
  }
}
