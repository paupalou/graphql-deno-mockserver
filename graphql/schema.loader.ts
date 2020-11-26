import type { Schema } from "../types.ts";

export const loadSchema = (filePath: string): Schema =>
  JSON.parse(Deno.readTextFileSync(filePath)) as Schema;
