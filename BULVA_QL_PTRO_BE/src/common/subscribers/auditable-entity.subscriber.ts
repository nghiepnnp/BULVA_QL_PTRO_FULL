import {
  DataSource,
  EntityMetadata,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  ObjectLiteral,
  RecoverEvent,
  SoftRemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '#/common/context/current-user.context';

@Injectable()
@EventSubscriber()
export class AuditableEntitySubscriber implements EntitySubscriberInterface {
  constructor(
    dataSource: DataSource,
    private readonly currentUser: CurrentUserContext,
  ) {
    // Đăng ký event
    dataSource.subscribers.push(this);
  }

  // Cập nhật thông tin audit trước khi lưu xuống database
  beforeInsert(event: InsertEvent<ObjectLiteral>): void {
    if (!event.entity) {
      return;
    }

    const userId = this.currentUser.userId;

    // console.log('4. Subscriber userId:', userId);
    // console.log('5. Subscriber entity:', event.entity);

    if (this.hasColumn(event.metadata, 'createdBy')) {
      event.entity.createdBy = userId;
    }

    if (this.hasColumn(event.metadata, 'updatedBy')) {
      event.entity.updatedBy = userId;
    }

    // console.log('6. Entity after audit:', event.entity);
  }

  // Cập nhật thông tin audit trước khi lưu xuống database
  beforeUpdate(event: UpdateEvent<ObjectLiteral>): void {
    if (!event.entity) {
      return;
    }

    // console.log('4. Subscriber userId:', this.currentUser.userId);
    // console.log('5. Subscriber entity:', event.entity);

    if (this.hasColumn(event.metadata, 'updatedBy')) {
      event.entity.updatedBy = this.currentUser.userId;
    }

    // console.log('Entity after update audit:', event.entity);
  }

  beforeSoftRemove(event: SoftRemoveEvent<ObjectLiteral>): void {
    if (!event.entity) {
      return;
    }

    const userId = this.currentUser.userId;

    if (this.hasColumn(event.metadata, 'deletedBy')) {
      event.entity.deletedBy = userId;
    }

    if (this.hasColumn(event.metadata, 'updatedBy')) {
      event.entity.updatedBy = userId;
    }
  }

  beforeRecover(event: RecoverEvent<ObjectLiteral>): void {
    if (!event.entity) {
      return;
    }

    if (this.hasColumn(event.metadata, 'deletedBy')) {
      event.entity.deletedBy = null;
    }

    if (this.hasColumn(event.metadata, 'updatedBy')) {
      event.entity.updatedBy = this.currentUser.userId;
    }
  }

  private hasColumn(metadata: EntityMetadata, propertyName: string): boolean {
    return metadata.columns.some(
      (column) => column.propertyName === propertyName,
    );
  }
}
