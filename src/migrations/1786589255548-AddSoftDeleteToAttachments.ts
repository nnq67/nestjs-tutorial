import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToAttachments1786589255548 implements MigrationInterface {
    name = 'AddSoftDeleteToAttachments1786589255548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_attachments_attachable"`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_attachments_active_attachable" ON "attachments" ("attachable_type", "attachable_id") WHERE "deleted_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_attachments_active_attachable"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_attachments_attachable" ON "attachments" ("attachable_type", "attachable_id") `);
    }

}
