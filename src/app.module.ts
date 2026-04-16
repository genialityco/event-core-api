import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';

// Core multi-tenant
import { TenantModule } from './core/tenant/tenant.module';
import { TenantMiddleware } from './core/tenant/tenant.middleware';
import { OtpModule } from './auth/otp/otp.module';

// Módulos de negocio
import { AttendeeModule } from './attendee/attendee.module';
import { CertificateModule } from './certificate/certificate.module';
import { EventModule } from './event/event.module';
import { OrganizationModule } from './organization/organization.module';
import { SpeakersModule } from './speakers/speakers.module';
import { DocumentsModule } from './documents/documents.module';
import { initializeFirebaseAdmin } from './config/firebase-admin.config';
import { AgendaModule } from './agenda/agenda.module';
import { ModulesModule } from './modules/modules.module';
import { RoomsModule } from './rooms/rooms.module';
import { UserModule } from './user/user.module';
import { MemberModule } from './member/member.module';
import { SurveyModule } from './survey/survey.module';
import { PostersModule } from './posters/posters.module';
import { NewsModule } from './news/news.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HighlightsModule } from './highlights/highlights.module';
import { NotificationTemplateModule } from './notification-template/notification-template.module';
import { TravelerModule } from './traveler/traveler.module';
import { HotelsModule } from './hotels/hotels.module';
import { PhotosModule } from './photos/photos.module';
import { UploadController } from './utils/UploadController';
import { UsefulInfoModule } from './useful-info/useful-info.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MulterModule.register({ dest: './uploads' }),

    // CRÍTICO: TenantModule ANTES de los módulos de negocio
    // @Global() hace que TenantContextService esté disponible en todos los módulos sin importarlo
    TenantModule,
    OtpModule,

    AttendeeModule,
    CertificateModule,
    EventModule,
    OrganizationModule,
    SpeakersModule,
    DocumentsModule,
    AgendaModule,
    ModulesModule,
    RoomsModule,
    UserModule,
    MemberModule,
    SurveyModule,
    PostersModule,
    NewsModule,
    NotificationsModule,
    HighlightsModule,
    NotificationTemplateModule,
    TravelerModule,
    HotelsModule,
    PhotosModule,
    UsefulInfoModule,
    AdminModule,
  ],
  controllers: [UploadController],
  providers: [initializeFirebaseAdmin],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        // Rutas públicas — sin token, sin tenant context
        { path: 'health', method: RequestMethod.GET },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/otp/register', method: RequestMethod.POST },
        { path: 'auth/otp/login', method: RequestMethod.POST },
        { path: 'auth/otp/send', method: RequestMethod.POST },
        { path: 'auth/otp/verify', method: RequestMethod.POST },
        { path: 'auth/otp/validate-email', method: RequestMethod.POST },
        { path: 'auth/otp/org-config', method: RequestMethod.GET },
        // Rutas admin del CMS — sin auth de tenant
        { path: 'admin/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
