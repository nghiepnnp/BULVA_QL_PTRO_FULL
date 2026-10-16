import { Column, DeleteDateColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity.js';

export abstract class SoftDeleteEntity extends AuditableEntity {
  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt: Date | null;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  deletedBy: string | null;
}

// KẾ THỪA NẾU "SOFT DELETE"
