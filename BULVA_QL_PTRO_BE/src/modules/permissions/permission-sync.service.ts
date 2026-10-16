import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { getPermissionDefinitions } from '../../define-permission.js';
import { Permission } from '../../domain/permission.entity.js';

@Injectable()
export class PermissionSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionSyncService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.sync();
  }

  async sync(): Promise<void> {
    const definitions = getPermissionDefinitions();
    this.assertUniqueDefinitions(definitions);

    const result = await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `SELECT pg_advisory_xact_lock(hashtext('permission-source-sync'))`,
      );

      const repository = manager.getRepository(Permission);
      const existingPermissions = await repository.find();
      const existingByCode = new Map(
        existingPermissions.map((permission) => [permission.code, permission]),
      );
      const sourceCodes = new Set(
        definitions.map((definition) => definition.code),
      );

      const inactivePermissions = existingPermissions.filter(
        (permission) => !sourceCodes.has(permission.code),
      );
      const permissionsToDeactivate = inactivePermissions.filter(
        (permission) => permission.isActive || permission.isDefault,
      );

      if (permissionsToDeactivate.length > 0) {
        await repository
          .createQueryBuilder()
          .update(Permission)
          .set({ isActive: false, isDefault: false })
          .whereInIds(
            permissionsToDeactivate.map((permission) => permission.id),
          )
          .execute();
      }

      const changedPermissions = definitions
        .map((definition) => {
          const existing = existingByCode.get(definition.code);
          if (
            !existing ||
            (existing.name === definition.name &&
              existing.isDefault === definition.isDefault &&
              existing.isActive)
          ) {
            return undefined;
          }

          return existing;
        })
        .filter((permission): permission is Permission => Boolean(permission));

      // Free old unique names first, including when two definitions swap names.
      const renamedPermissions = changedPermissions.filter((permission) => {
        const definition = definitions.find(
          (item) => item.code === permission.code,
        );
        return definition && definition.name !== permission.name;
      });

      for (const permission of renamedPermissions) {
        await repository.update(permission.id, {
          name: `__permission_sync__${permission.id}`,
        });
      }

      const permissionsToSave = definitions.map((definition) => {
        const permission =
          existingByCode.get(definition.code) ?? repository.create();

        permission.code = definition.code;
        permission.name = definition.name;
        permission.description ??= null;
        permission.isDefault = definition.isDefault;
        permission.isActive = true;

        return permission;
      });

      const inserted = permissionsToSave.filter(
        (permission) => !existingByCode.has(permission.code),
      ).length;

      await repository.save(permissionsToSave);

      return {
        total: definitions.length,
        inserted,
        updated: changedPermissions.length,
        deactivated: permissionsToDeactivate.filter(
          (permission) => permission.isActive,
        ).length,
      };
    });

    this.logger.log(
      `Permissions synchronized: total=${result.total}, inserted=${result.inserted}, updated=${result.updated}, deactivated=${result.deactivated}`,
    );
  }

  private assertUniqueDefinitions(
    definitions: ReadonlyArray<{ code: string; name: string }>,
  ): void {
    const codes = new Set<string>();
    const names = new Set<string>();

    for (const definition of definitions) {
      if (codes.has(definition.code)) {
        throw new Error(`Duplicate permission code: ${definition.code}`);
      }
      if (names.has(definition.name)) {
        throw new Error(`Duplicate permission name: ${definition.name}`);
      }

      codes.add(definition.code);
      names.add(definition.name);
    }
  }
}
