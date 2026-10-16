import { OnEvent } from '@nestjs/event-emitter';
import { MailerEvent } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import type { MailerEventPayload } from '@nestjs-modules/mailer';

@Injectable()
export class EmailEventListener {
  private readonly logger = new Logger(EmailEventListener.name);

  @OnEvent(MailerEvent.BEFORE_SEND)
  handleEmailBeforeSent(payload: MailerEventPayload) {
    this.logger.log({
      message: 'Email is being sent',
      to: payload.mailOptions.to,
    });

    // TODO: Lưu vào log, sau này bắn notification cho frontend (Xử lý dùng Kafka))
  }

  @OnEvent(MailerEvent.AFTER_SEND)
  handleEmailSent(payload: MailerEventPayload) {
    this.logger.log({
      message: 'Email sent',
      to: payload.mailOptions.to,
      messageId: payload.result?.messageId,
    });

    // TODO: Lưu vào log, sau này bắn notification cho frontend (Xử lý dùng Kafka))
  }

  @OnEvent(MailerEvent.SEND_ERROR)
  handleEmailError(payload: MailerEventPayload) {
    this.logger.error(
      {
        message: 'Email failed',
        to: payload.mailOptions.to,
      },
      payload.error?.stack ?? payload.error?.message,
    );

    // TODO: Lưu vào log, sau này bắn notification cho frontend (Xử lý dùng Kafka))
  }
}
