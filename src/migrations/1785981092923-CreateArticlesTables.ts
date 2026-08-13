import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticlesTables1785981092923 implements MigrationInterface {
  name = 'CreateArticlesTables1785981092923';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "article_favorites" ("id" SERIAL NOT NULL, "article_id" integer NOT NULL, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f11256124cd89a152723cde0440" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_article_favorites_user_id" ON "article_favorites" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_article_favorites_article_id" ON "article_favorites" ("article_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_article_favorites_pair" ON "article_favorites" ("article_id", "user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "articles" ("id" SERIAL NOT NULL, "slug" character varying(255) NOT NULL, "title" character varying(255) NOT NULL, "description" character varying(500) NOT NULL, "body" text NOT NULL, "tag_list" character varying array NOT NULL DEFAULT '{}', "author_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_articles_created_at" ON "articles" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_articles_author_id" ON "articles" ("author_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_articles_slug" ON "articles" ("slug") `,
    );
    await queryRunner.query(
      `ALTER TABLE "article_favorites" ADD CONSTRAINT "FK_article_favorites_article" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_favorites" ADD CONSTRAINT "FK_article_favorites_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "FK_articles_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "FK_articles_author"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_favorites" DROP CONSTRAINT "FK_article_favorites_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_favorites" DROP CONSTRAINT "FK_article_favorites_article"`,
    );
    await queryRunner.query(`DROP INDEX "public"."UQ_articles_slug"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_articles_author_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_articles_created_at"`);
    await queryRunner.query(`DROP TABLE "articles"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_article_favorites_pair"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_article_favorites_article_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_article_favorites_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "article_favorites"`);
  }
}
