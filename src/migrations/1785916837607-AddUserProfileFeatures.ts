import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFeatures1785916837607 implements MigrationInterface {
  name = 'AddUserProfileFeatures1785916837607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "attachments" ("id" uuid NOT NULL, "attachable_type" character varying NOT NULL, "attachable_id" integer NOT NULL, "url" character varying NOT NULL, "file_name" character varying NOT NULL, "file_type" character varying NOT NULL, "file_size" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_attachments_attachable" ON "attachments" ("attachable_type", "attachable_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_follows" ("id" SERIAL NOT NULL, "follower_id" integer NOT NULL, "following_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_user_follows_not_self" CHECK ("follower_id" <> "following_id"), CONSTRAINT "PK_da8e8793113adf3015952880966" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_follows_following_id" ON "user_follows" ("following_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_follows_follower_id" ON "user_follows" ("follower_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_user_follows_pair" ON "user_follows" ("follower_id", "following_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "bio" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" ADD CONSTRAINT "FK_user_follows_follower" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" ADD CONSTRAINT "FK_user_follows_following" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_follows" DROP CONSTRAINT "FK_user_follows_following"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" DROP CONSTRAINT "FK_user_follows_follower"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_user_follows_pair"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_follows_follower_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_follows_following_id"`,
    );
    await queryRunner.query(`DROP TABLE "user_follows"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_attachments_attachable"`);
    await queryRunner.query(`DROP TABLE "attachments"`);
  }
}
