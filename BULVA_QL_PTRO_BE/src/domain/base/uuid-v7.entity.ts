import { BeforeInsert, PrimaryColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

export abstract class UuidV7Entity {
  @PrimaryColumn({
    type: 'uuid',
  })
  id: string;

  @BeforeInsert()
  protected generateId(): void {
    this.id ??= uuidv7();
  }
}
