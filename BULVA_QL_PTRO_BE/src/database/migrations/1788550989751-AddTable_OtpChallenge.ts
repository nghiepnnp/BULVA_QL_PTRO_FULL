import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTableOtpChallenge1788550989751 implements MigrationInterface {
  name = 'AddTableOtpChallenge1788550989751';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."otp_challenges_purpose_enum" AS ENUM('EMAIL_VERIFY', 'PHONE_VERIFY', 'LOGIN_OTP', 'PASSWORD_RESET')`,
    );
    await queryRunner.query(
      `CREATE TABLE "otp_challenges" ("id" uuid NOT NULL, "userId" uuid, "target" character varying NOT NULL, "purpose" "public"."otp_challenges_purpose_enum" NOT NULL, "codeHash" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "consumedAt" TIMESTAMP WITH TIME ZONE, "attemptCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c34f21df6c8aa51229715452068" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "emailVerified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'PENDING', 'LOCKED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'PENDING'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lastLoginAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "loginType"`);
    await queryRunner.query(
      `CREATE TYPE "public"."users_logintype_enum" AS ENUM('INTERNAL', 'GOOGLE', 'FACEBOOK', 'GITHUB')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "loginType" "public"."users_logintype_enum" NOT NULL DEFAULT 'INTERNAL'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "loginType"`);
    await queryRunner.query(`DROP TYPE "public"."users_logintype_enum"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "loginType" character varying NOT NULL DEFAULT 'INTERNAL'`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLoginAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerified"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isActive" boolean NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "otp_challenges"`);
    await queryRunner.query(`DROP TYPE "public"."otp_challenges_purpose_enum"`);
  }
}
