import { CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';
import { UuidV7Entity } from './uuid-v7.entity.js';

export abstract class BaseEntity extends UuidV7Entity {
  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  createdBy: string | null;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  updatedBy: string | null;
}
