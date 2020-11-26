import {
  parseSchemaInputTypeDefinitions,
  parseSchemaMutations,
  parseSchemaQueries,
  parseSchemaTypeDefinitions,
} from "./types.parser.ts";

import { parseSchemaResolvers } from "./resolvers.parser.ts";
import {
  OperationTypes,
  SchemaResolvers,
  SchemaTypes,
} from "../types.ts";

import type { Schema } from "../types.ts";

export default (schema: Schema) => {
  const types = {
    [SchemaTypes.TypeDefinitions]: () => parseSchemaTypeDefinitions(schema),
    [SchemaTypes.InputTypeDefinitions]: () =>
      parseSchemaInputTypeDefinitions(schema),
    [SchemaTypes.Queries]: () => parseSchemaQueries(schema),
    [SchemaTypes.Mutations]: () => parseSchemaMutations(schema),
  };

  const resolvers = {
    [SchemaResolvers.Query]: () =>
      parseSchemaResolvers(OperationTypes.Query)(schema),
    [SchemaResolvers.Mutation]: () =>
      parseSchemaResolvers(OperationTypes.Mutation)(schema),
  };

  return {
    parseType: (value: SchemaTypes) => types[value](),
    parseResolver: (value: SchemaResolvers) => resolvers[value](),
  };
};
