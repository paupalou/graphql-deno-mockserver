import type { MockedOperation, Schema, TypeDef } from "../types.ts";

const NEW_LINE = "\n";

function renderField(fields: { [key: string]: unknown }, keysLength: number) {
  return (fieldKey: string, fieldIndex: number) =>
    `${fieldIndex > 0 ? "  " : ""}${fieldKey}: ${fields[fieldKey]}${
      (fieldIndex + 1) < keysLength ? "\n" : ""
    }`;
}

function renderTypeDefinition(definitionObjectType: string) {
  return (typeDef: TypeDef) => {
    const fieldKeys = Object.keys(typeDef.fields);
    const fields = fieldKeys.map(renderField(typeDef.fields, fieldKeys.length)).join("");
    return `${definitionObjectType} ${typeDef.name} {\n  ${fields}\n}`;
  }
}

function parseOperation(query: MockedOperation) {
  return `${query.typeDef}: ${query.return}`;
}

function parseSchemaQueries(schema: Schema) {
  const queries = schema.queries?.map(parseOperation).join(`\n  `);
  return `type Query {\n  ${queries}\n}`;
}

function parseSchemaMutations(schema: Schema) {
  const mutations = schema.mutations?.map(parseOperation).join(`\n  `);
  return `type Mutation {\n  ${mutations}\n}`;
}

function parseSchemaTypeDefinitions(schema: Schema) {
  return schema.types.map(renderTypeDefinition("type")).join(NEW_LINE);
}

function parseSchemaInputTypeDefinitions(schema: Schema) {
  return schema.inputs?.map(renderTypeDefinition("input")).join(NEW_LINE);
}

export {
  parseSchemaInputTypeDefinitions,
  parseSchemaMutations,
  parseSchemaQueries,
  parseSchemaTypeDefinitions,
};
