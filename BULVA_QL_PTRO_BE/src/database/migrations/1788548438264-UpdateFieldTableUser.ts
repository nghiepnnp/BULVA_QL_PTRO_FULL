import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFieldTableUser1788548438264 implements MigrationInterface {
  name = 'UpdateFieldTableUser1788548438264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "name" TO "username"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "loginType" character varying NOT NULL DEFAULT 'INTERNAL'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "username" TO "name"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "loginType"`);
  }
}
