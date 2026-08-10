import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  I18nValidationExceptionFilter,
  I18nValidationPipe,
} from 'nestjs-i18n';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { truncateDatabase } from './helpers/database.helper';

interface RegisterResponse {
  user: {
    id: number;
    username: string;
    email: string;
    token: string;
  };
}

interface ArticleResponse {
  article: {
    slug: string;
  };
}

interface CommentResponse {
  comment: {
    id: number;
    body: string;
    createdAt: string;
    updatedAt: string;
    author: {
      username: string;
      bio: string | null;
      image: string | null;
      following: boolean;
    };
  };
}

interface CommentsResponse {
  comments: CommentResponse['comment'][];
}

describe('CommentController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let accessToken: string;
  let articleSlug: string;

  async function createUser(
    username = 'e2e-user',
    email = 'e2e-user@example.com',
  ): Promise<RegisterResponse['user']> {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username,
        email,
        password: 'securePassword123',
      })
      .expect(201);

    const body = response.body as RegisterResponse;

    return body.user;
  }

  async function createArticle(
    token: string,
    title = 'E2E Article',
  ): Promise<ArticleResponse['article']> {
    const response = await request(app.getHttpServer())
      .post('/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        article: {
          title,
          description: 'Article for E2E testing',
          body: 'This article is created by the E2E test.',
          tagList: ['e2e'],
        },
      })
      .expect(201);

    const body = response.body as ArticleResponse;

    return body.article;
  }

  async function createComment(
    token: string,
    slug: string,
    commentBody = 'E2E comment',
  ): Promise<CommentResponse['comment']> {
    const response = await request(app.getHttpServer())
      .post(`/articles/${slug}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: {
          body: commentBody,
        },
      })
      .expect(201);

    const body = response.body as CommentResponse;

    return body.comment;
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new I18nValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(
      new I18nValidationExceptionFilter(),
    );

    await app.init();

    dataSource = app.get(DataSource);

    await truncateDatabase(dataSource);

    const user = await createUser();

    accessToken = user.token;

    const article = await createArticle(accessToken);

    articleSlug = article.slug;
  });

  afterEach(async () => {
    await truncateDatabase(dataSource);
    await app.close();
  });

  describe('POST /articles/:slug/comments', () => {
    it('creates a comment successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/articles/${articleSlug}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          comment: {
            body: 'Great article!',
          },
        })
        .expect(201);

      const body = response.body as CommentResponse;

      expect(body.comment).toMatchObject({
        body: 'Great article!',
        author: {
          username: 'e2e-user',
          bio: null,
          image: null,
          following: false,
        },
      });

      expect(body.comment.id).toEqual(expect.any(Number));
      expect(body.comment.createdAt).toBeDefined();
      expect(body.comment.updatedAt).toBeDefined();
    });

    it('returns 401 without access token', async () => {
      await request(app.getHttpServer())
        .post(`/articles/${articleSlug}/comments`)
        .send({
          comment: {
            body: 'Unauthorized comment',
          },
        })
        .expect(401);
    });

    it('returns 400 when comment body is empty', async () => {
      await request(app.getHttpServer())
        .post(`/articles/${articleSlug}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          comment: {
            body: '',
          },
        })
        .expect(400);
    });

    it('returns 400 when comment body contains only whitespace', async () => {
      await request(app.getHttpServer())
        .post(`/articles/${articleSlug}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          comment: {
            body: '   ',
          },
        })
        .expect(400);
    });

    it('returns 404 when article does not exist', async () => {
      await request(app.getHttpServer())
        .post('/articles/article-does-not-exist/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          comment: {
            body: 'Comment on missing article',
          },
        })
        .expect(404);
    });

    it('persists the created comment', async () => {
      await createComment(
        accessToken,
        articleSlug,
        'Persisted comment',
      );

      const response = await request(app.getHttpServer())
        .get(`/articles/${articleSlug}/comments`)
        .expect(200);

      const body = response.body as CommentsResponse;

      expect(body.comments).toHaveLength(1);

      expect(body.comments[0]).toMatchObject({
        body: 'Persisted comment',
        author: {
          username: 'e2e-user',
        },
      });
    });
  });

  describe('GET /articles/:slug/comments', () => {
    it('returns comments without authentication', async () => {
      await createComment(
        accessToken,
        articleSlug,
        'First E2E comment',
      );

      await createComment(
        accessToken,
        articleSlug,
        'Second E2E comment',
      );

      const response = await request(app.getHttpServer())
        .get(`/articles/${articleSlug}/comments`)
        .expect(200);

      const body = response.body as CommentsResponse;

      expect(body.comments).toHaveLength(2);

      expect(body.comments[0]).toMatchObject({
        body: 'First E2E comment',
        author: {
          username: 'e2e-user',
          following: false,
        },
      });

      expect(body.comments[1]).toMatchObject({
        body: 'Second E2E comment',
        author: {
          username: 'e2e-user',
          following: false,
        },
      });
    });

    it('returns an empty array when article has no comments', async () => {
      const response = await request(app.getHttpServer())
        .get(`/articles/${articleSlug}/comments`)
        .expect(200);

      const body = response.body as CommentsResponse;

      expect(body.comments).toEqual([]);
    });

    it('returns 404 when article does not exist', async () => {
      await request(app.getHttpServer())
        .get('/articles/article-does-not-exist/comments')
        .expect(404);
    });
  });

  describe('DELETE /articles/:slug/comments/:id', () => {
    it('deletes own comment successfully', async () => {
      const comment = await createComment(
        accessToken,
        articleSlug,
        'Comment to delete',
      );

      await request(app.getHttpServer())
        .delete(
          `/articles/${articleSlug}/comments/${comment.id}`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(`/articles/${articleSlug}/comments`)
        .expect(200);

      const body = response.body as CommentsResponse;

      expect(body.comments).toEqual([]);
    });

    it('returns 401 without access token', async () => {
      const comment = await createComment(
        accessToken,
        articleSlug,
        'Protected comment',
      );

      await request(app.getHttpServer())
        .delete(
          `/articles/${articleSlug}/comments/${comment.id}`,
        )
        .expect(401);
    });

    it('returns 403 when another user deletes the comment', async () => {
      const comment = await createComment(
        accessToken,
        articleSlug,
        'Owner comment',
      );

      const anotherUser = await createUser(
        'another-user',
        'another-user@example.com',
      );

      await request(app.getHttpServer())
        .delete(
          `/articles/${articleSlug}/comments/${comment.id}`,
        )
        .set(
          'Authorization',
          `Bearer ${anotherUser.token}`,
        )
        .expect(403);

      const response = await request(app.getHttpServer())
        .get(`/articles/${articleSlug}/comments`)
        .expect(200);

      const body = response.body as CommentsResponse;

      expect(body.comments).toHaveLength(1);

      expect(body.comments[0]).toMatchObject({
        id: comment.id,
        body: 'Owner comment',
      });
    });

    it('returns 404 when comment does not exist', async () => {
      await request(app.getHttpServer())
        .delete(
          `/articles/${articleSlug}/comments/999999`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('returns 404 when article does not exist', async () => {
      await request(app.getHttpServer())
        .delete(
          '/articles/article-does-not-exist/comments/1',
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('returns 400 when comment id is invalid', async () => {
      await request(app.getHttpServer())
        .delete(
          `/articles/${articleSlug}/comments/abc`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('returns 404 when comment belongs to another article', async () => {
      const comment = await createComment(
        accessToken,
        articleSlug,
        'Comment from first article',
      );

      const secondArticle = await createArticle(
        accessToken,
        'Second E2E Article',
      );

      await request(app.getHttpServer())
        .delete(
          `/articles/${secondArticle.slug}/comments/${comment.id}`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      const response = await request(app.getHttpServer())
        .get(`/articles/${articleSlug}/comments`)
        .expect(200);

      const body = response.body as CommentsResponse;

      expect(body.comments).toHaveLength(1);

      expect(body.comments[0]).toMatchObject({
        id: comment.id,
        body: 'Comment from first article',
      });
    });
  });
});