export const PERMISSIONS = {
  POST: {
    CREATE: { resource: 'Post', action: 'create' },
    READ: { resource: 'Post', action: 'read' },
    UPDATE: { resource: 'Post', action: 'update' },
    DELETE: { resource: 'Post', action: 'delete' },
  },
} as const;
