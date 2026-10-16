import { MailerModule } from '@nestjs-modules/mailer';
import { SendMailService } from './send-mail.service.js';
import { Module } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { EnvService } from '../../config/env/env.service.js';
import { ConfigModule } from '@nestjs/config/dist/index.js';
import { EmailEventListener } from './email-event-listener.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

@Module({
  imports: [
    // MailerModule.forRoot({
    //   transport: {
    //     host: 'smtp.example.com',
    //     port: 587,
    //     secure: false,
    //     auth: {
    //       user: 'no-reply@mnstd.com',
    //       pass: 'HAMAtE,-,96',
    //     },
    //   },
    //   defaults: {
    //     from: '"No Reply" <no-reply@mnstd.com>',
    //   },
    //   template: {
    //     dir: __dirname + '/templates',
    //     adapter: new HandlebarsAdapter(),
    //     options: {
    //       strict: true,
    //     },
    //   },
    // }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        transport: {
          host: env.smtpHost,
          port: env.smtpPort,
          secure: false,
          auth: {
            user: env.smtpUser,
            pass: env.smtpPass,
          },
        },

        defaults: {
          from: '"MN STD" <no-reply@mnstd.com>',
        },
        template: {
          //   dir: __dirname + '/templates',
          dir: join(process.cwd(), '/templates/email'),
          //   dir: join(dirname(fileURLToPath(import.meta.url)), 'email'),
          //   dir: join(
          //     dirname(fileURLToPath(import.meta.url)),
          //     '..',
          //     '..',
          //     'templates',
          //     'email',
          //   ),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  controllers: [],
  providers: [SendMailService, EmailEventListener],
  exports: [SendMailService],
})
export class SendMailModule {}
