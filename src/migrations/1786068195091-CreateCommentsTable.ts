import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsTable1786068195091 implements MigrationInterface {
  name = 'CreateCommentsTable1786068195091';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" SERIAL NOT NULL, "body" text NOT NULL, "article_id" integer NOT NULL, "author_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_article_created_at" ON "comments" ("article_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_author_id" ON "comments" ("author_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_article_id" ON "comments" ("article_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_article" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_author"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_article"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_comments_article_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_comments_author_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_comments_article_created_at"`,
    );
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}
