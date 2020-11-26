import { assert, assertThrows } from "https://deno.land/std/testing/asserts.ts";

import { loadSchema } from "./schema.loader.ts";

Deno.test(
  "SchemaLoader::loadSchema throws error when schema does not exists",
  () => {
    const schemaLoaded = () => loadSchema("inventedPath");
    assertThrows(schemaLoaded);
  },
);

Deno.test(
  "SchemaLoader::loadSchema find schema file when path is correct",
  () => {
    assert(loadSchema("graphql/schema.json"));
  },
);
