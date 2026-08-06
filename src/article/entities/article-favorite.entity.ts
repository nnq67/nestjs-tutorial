import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { Article } from './article.entity';

@Entity('article_favorites')
@Index('UQ_article_favorites_pair', ['articleId', 'userId'], {
  unique: true,
})
@Index('IDX_article_favorites_article_id', ['articleId'])
@Index('IDX_article_favorites_user_id', ['userId'])
export class ArticleFavorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'article_id',
    type: 'integer',
  })
  articleId!: number;

  @Column({
    name: 'user_id',
    type: 'integer',
  })
  userId!: number;

  @ManyToOne(() => Article, (article) => article.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'article_id',
    foreignKeyConstraintName: 'FK_article_favorites_article',
  })
  article!: Article;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_article_favorites_user',
  })
  user!: User;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt!: Date;
}
