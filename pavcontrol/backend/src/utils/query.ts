import { ParsedQs } from 'qs'
export const qs = (val: string | string[] | ParsedQs | ParsedQs[] | (string | ParsedQs)[] | undefined): string | undefined =>
  Array.isArray(val) ? (val[0] as string) : (val as string | undefined)
