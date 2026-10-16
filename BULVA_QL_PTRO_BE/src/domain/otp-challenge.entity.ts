import { Entity } from 'typeorm/browser/decorator/entity/Entity.js';
import { UuidV7Entity } from './base/uuid-v7.entity.js';
import { Column } from 'typeorm/browser/decorator/columns/Column.js';
import { CreateDateColumn } from 'typeorm/browser/decorator/columns/CreateDateColumn.js';
import { OtpChallengePurpose } from '../common/enums/enum.js';

@Entity('otp_challenges')
export class OtpChallenge extends UuidV7Entity {

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  // Email hoặc số điện thoại mà OTP được gửi đến
  @Column()
  target: string;

  @Column({ type: 'enum', enum: OtpChallengePurpose })
  purpose: OtpChallengePurpose;

  @Column()
  codeHash: string;

  // Thời gian hết hạn của OTP, nếu quá thời gian này thì OTP sẽ không còn hiệu lực
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  // Thời gian OTP được sử dụng, nếu null thì chưa sử dụng
  @Column({ type: 'timestamptz', nullable: true })
  consumedAt: Date | null;

  // Số lần gửi, nếu vượt quá giới hạn thì sẽ bị khóa
  @Column({ default: 0 })
  attemptCount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
