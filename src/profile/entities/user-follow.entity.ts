import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';

@Entity('user_follows')
@Index('UQ_user_follows_pair', ['followerId', 'followingId'], {
  unique: true,
})
@Index('IDX_user_follows_follower_id', ['followerId'])
@Index('IDX_user_follows_following_id', ['followingId'])
@Check('CHK_user_follows_not_self', '"follower_id" <> "following_id"')
export class UserFollow {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'follower_id',
    type: 'integer',
  })
  followerId!: number;

  @Column({
    name: 'following_id',
    type: 'integer',
  })
  followingId!: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'follower_id',
    foreignKeyConstraintName: 'FK_user_follows_follower',
  })
  follower!: User;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'following_id',
    foreignKeyConstraintName: 'FK_user_follows_following',
  })
  following!: User;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt!: Date;
}
