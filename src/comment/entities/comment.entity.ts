import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Article } from '../../article/entities/article.entity';
import { User } from '../../user/entities/user.entity';

@Entity('comments')
@Index('IDX_comments_article_id', ['articleId'])
@Index('IDX_comments_author_id', ['authorId'])
@Index('IDX_comments_article_created_at', ['articleId', 'createdAt'])
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'text',
  })
  body!: string;

  @Column({
    name: 'article_id',
    type: 'integer',
  })
  articleId!: number;

  @ManyToOne(() => Article, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'article_id',
    foreignKeyConstraintName: 'FK_comments_article',
  })
  article!: Article;

  @Column({
    name: 'author_id',
    type: 'integer',
  })
  authorId!: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'author_id',
    foreignKeyConstraintName: 'FK_comments_author',
  })
  author!: User;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt!: Date;
}
