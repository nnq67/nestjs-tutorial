import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { ArticleFavorite } from './article-favorite.entity';

@Entity('articles')
@Index('UQ_articles_slug', ['slug'], {
  unique: true,
})
@Index('IDX_articles_author_id', ['authorId'])
@Index('IDX_articles_created_at', ['createdAt'])
export class Article {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  slug!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'varchar',
    length: 500,
  })
  description!: string;

  @Column({
    type: 'text',
  })
  body!: string;

  @Column({
    name: 'tag_list',
    type: 'varchar',
    array: true,
    default: () => "'{}'",
  })
  tagList!: string[];

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
    foreignKeyConstraintName: 'FK_articles_author',
  })
  author!: User;

  @OneToMany(() => ArticleFavorite, (favorite) => favorite.article)
  favorites!: ArticleFavorite[];

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
