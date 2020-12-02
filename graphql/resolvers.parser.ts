import type { RouterContext } from "https://deno.land/x/oak@v6.2.0/mod.ts";

import { OperationTypes, QueryOrMutationFn } from "../types.ts";
import { getMatchinResponse } from "./helpers.ts";

import type { Schema } from "../types.ts";

function parseSchemaResolvers(operationType: OperationTypes) {
  return (schema: Schema): { [key:string]: QueryOrMutationFn } =>
    (schema[operationType] ?? []).reduce((acc, current) => ({
      ...acc,
      [`${current.operation}`]: (
        _: unknown,
        inputParams: Record<string, unknown>,
        context: RouterContext,
      ) =>
        getMatchinResponse(current, context, inputParams) ?? current.response,
    }), {});
}

export { parseSchemaResolvers };
