export const BASE_OPTIONS = ['ascii', 'hex', 'decimal', 'base64', 'octal'] as const;
export type BaseType = (typeof BASE_OPTIONS)[number];