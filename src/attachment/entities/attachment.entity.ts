import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('attachments')
@Index(
  'UQ_attachments_active_attachable',
  ['attachableType', 'attachableId'],
  {
    unique: true,
    where: '"deleted_at" IS NULL',
  },
)
export class Attachment {
  @PrimaryColumn({
    type: 'uuid',
  })
  id!: string;

  @Column({
    name: 'attachable_type',
    type: 'varchar',
  })
  attachableType!: string;

  @Column({
    name: 'attachable_id',
    type: 'integer',
  })
  attachableId!: number;

  @Column({
    type: 'varchar',
  })
  url!: string;

  @Column({
    name: 'file_name',
    type: 'varchar',
  })
  fileName!: string;

  @Column({
    name: 'file_type',
    type: 'varchar',
  })
  fileType!: string;

  @Column({
    name: 'file_size',
    type: 'integer',
  })
  fileSize!: number;

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

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt!: Date | null;
}