import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SendMailService {
  private readonly logger = new Logger(SendMailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async send(email: string, name: string, code: string) {
    await this.mailerService.sendMail({
      //   to: email,
      to: 'nghiepnguyen8499@gmail.com',
      // from: 'noreply@example.com',
      subject: 'Welcome!',
      template: 'otp',
      context: {
        logoUrl: 'https://example.com/logo.png',
        appName: 'MN STD',
        name: name,
        code: code,
        expiresIn: '5',
      },
      //   attachments: [
      //     // File from disk
      //     { filename: 'report.pdf', path: '/path/to/report.pdf' },
      //     // Buffer
      //     { filename: 'data.csv', content: Buffer.from('id,name\n1,John') },
      //     // String content
      //     { filename: 'notes.txt', content: 'Some notes here' },
      //     // URL (nodemailer will fetch it)
      //     { filename: 'logo.png', path: 'https://example.com/logo.png' },
      //   ],
    });
  }

  async activeAccount(username: string, activationUrl: string) {
    const kk = await this.mailerService.sendMail({
      //   to: email,
      to: 'nghiepnguyen8499@gmail.com',
      // from: 'noreply@example.com',
      subject: 'Kích hoạt tài khoản - ' + username,
      template: 'active-account',
      //   text: `Chào ${username}. Kích hoạt tài khoản tại: ${activationUrl}`,
      context: {
        logoUrl: 'https://example.com/logo.png',
        appName: 'MN STD',
        name: username,
        activationUrl: activationUrl,
        expiresIn: '5',
      },
      headers: {
        'X-Entity-Ref-ID': crypto.randomUUID(),
      },
    });

    this.logger.debug({
      message: 'Activation email accepted by SMTP server',
      messageId: kk.messageId,
    });
  }
}
