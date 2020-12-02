import type { RouterContext } from "https://deno.land/x/oak@v6.2.0/mod.ts";

export type MockedResponse = unknown;

export type QueryOrMutationFn = (
  parent: unknown,
  inputParams: Record<string, unknown>,
  context: Partial<RouterContext>,
) => MockedResponse;

export type MockedMatchingResponse = {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  response: MockedResponse;
};

export type MockedOperation = {
  operation: string;
  typeDef: string;
  response?: MockedResponse;
  possibleResponses?: MockedMatchingResponse[];
  return: string;
};

export type TypeDef = {
  name: string;
  fields: { [key: string]: unknown };
};

export type InputDef = {
  name: string;
  fields: { [key: string]: unknown };
};

export type Schema = {
  types: TypeDef[];
  inputs?: InputDef[];
  queries?: MockedOperation[];
  mutations?: MockedOperation[];
};

export enum SchemaTypes {
  TypeDefinitions = "types",
  InputTypeDefinitions = "inputs",
  Queries = "queries",
  Mutations = "mutations",
}

export enum SchemaResolvers {
  Query = "queryResolvers",
  Mutation = "mutationResolvers",
}

export enum OperationTypes {
  Query = "queries",
  Mutation = "mutations",
}
