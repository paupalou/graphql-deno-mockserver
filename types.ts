export type QueryOrMutationFn = (
  parent: any,
  inputParams: { input: Record<string, any> },
  context: any,
) => unknown;

export type MockedResponse = Record<string, any> | Record<string, any>[] | any;

export type MockedMatchingResponse = {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  response: MockedResponse;
};

export type MockedOperation = {
  operation: string;
  typeDef: string;
  response?: MockedResponse;
  possibleResponses?: MockedMatchingResponse[];
  return: unknown;
};

export type TypeDef = {
  name: string;
  fields: { [key: string]: any };
};

export type InputDef = {
  name: string;
  fields: { [key: string]: any };
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
