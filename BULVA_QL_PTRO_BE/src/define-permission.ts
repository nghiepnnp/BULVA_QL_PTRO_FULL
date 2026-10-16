export const PERMISSIONS = {
  USERS: {
    VIEW: 'Permissions.Users.View',
    CREATE: 'Permissions.Users.Create',
    UPDATE: 'Permissions.Users.Update',
    DELETE: 'Permissions.Users.Delete',
    SEARCH: 'Permissions.Users.Search',
  },

  VIDEOS: {
    VIEW: 'Permissions.Videos.View',
    CREATE: 'Permissions.Videos.Create',
    UPDATE: 'Permissions.Videos.Update',
    DELETE: 'Permissions.Videos.Delete',
  },

  ROLES: {
    VIEW: 'Permissions.Roles.View',
    CREATE: 'Permissions.Roles.Create',
    UPDATE: 'Permissions.Roles.Update',
    DELETE: 'Permissions.Roles.Delete',
  },
  AUTH: {
    PPOFILE: 'Permissions.Auth.Profile',
  },
} as const;

type DeepValue<T> = T extends string
  ? T
  : { [Key in keyof T]: DeepValue<T[Key]> }[keyof T];

export type PermissionName = DeepValue<typeof PERMISSIONS>;

// Add permissions here when they should be assigned to newly created roles.
export const DEFAULT_PERMISSIONS =
  [] as const satisfies readonly PermissionName[];

export interface PermissionDefinition {
  code: string;
  name: string;
  isDefault: boolean;
}

export function getPermissionDefinitions(): PermissionDefinition[] {
  const defaultPermissions = new Set<string>(DEFAULT_PERMISSIONS);

  return Object.entries(PERMISSIONS).flatMap(([resource, actions]) =>
    Object.entries(actions).map(([action, name]) => ({
      code: `${resource}.${action}`,
      name,
      isDefault: defaultPermissions.has(name),
    })),
  );
}
