import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUUIDv71788230479358 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "id" DROP DEFAULT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid()
    `);
  }
}
