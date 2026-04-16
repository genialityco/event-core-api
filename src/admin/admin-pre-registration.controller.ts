import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  ConflictException,
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
    @Body() body: { email: string; name?: string; eventId?: string },
  ) {
    if (!body.email) throw new BadRequestException('El correo es requerido.');

    const email = body.email.toLowerCase().trim();
    const doc: any = { email, organizationId: new Types.ObjectId(orgId) };
    if (body.name) doc.name = body.name.trim();
    if (body.eventId) doc.eventId = new Types.ObjectId(body.eventId);

    try {
      const created = await this.preRegModel.create(doc);
      return new ResponseDto('success', 'Correo pre-registrado', created);
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException('Este correo ya está pre-registrado en la organización.');
      }
      throw err;
    }
  }

  /** POST /bulk — importación masiva de correos */
  @Post('bulk')
  async bulkImport(
    @Param('orgId') orgId: string,
    @Body()
    body: { emails: Array<{ email: string; name?: string }>; eventId?: string },
  ) {
    if (!body.emails?.length) {
      throw new BadRequestException('Se requiere al menos un correo.');
    }

    const orgObjectId = new Types.ObjectId(orgId);
    const eventObjectId = body.eventId ? new Types.ObjectId(body.eventId) : null;

    const ops = body.emails.map(({ email, name }) => ({
      updateOne: {
        filter: { email: email.toLowerCase().trim(), organizationId: orgObjectId },
        update: {
          $setOnInsert: {
            email: email.toLowerCase().trim(),
            organizationId: orgObjectId,
            eventId: eventObjectId,
            name: name?.trim() ?? null,
            isActivated: false,
            activatedAt: null,
            activatedByUserId: null,
          },
        },
        upsert: true,
      },
    }));

    const result = await this.preRegModel.bulkWrite(ops);
    const inserted = result.upsertedCount ?? 0;
    const skipped = body.emails.length - inserted;

    return new ResponseDto('success', `${inserted} correos importados, ${skipped} duplicados omitidos.`, {
      inserted,
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
