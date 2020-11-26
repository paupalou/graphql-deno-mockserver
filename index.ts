import {
  Application,
  Router,
  RouterContext,
} from "https://deno.land/x/oak@v6.2.0/mod.ts";
import {
  applyGraphQL,
  gql,
} from "https://deno.land/x/oak_graphql@0.6.2/mod.ts";

import { loadSchema } from "./graphql/schema.loader.ts";
import Schema from "./graphql/parser.ts";
import { SchemaResolvers, SchemaTypes } from "./types.ts";

const schema = loadSchema("./graphql/schema.json");

const schemaTypes = Schema(schema).parseType(SchemaTypes.TypeDefinitions);
const schemaInputTypes = Schema(schema).parseType(
  SchemaTypes.InputTypeDefinitions,
);
const schemaQueries = Schema(schema).parseType(SchemaTypes.Queries);
const schemaMutations = Schema(schema).parseType(SchemaTypes.Mutations);
const schemaQueryResolvers = Schema(schema).parseResolver(
  SchemaResolvers.Query,
);
const schemaMutationResolvers = Schema(schema).parseResolver(
  SchemaResolvers.Mutation,
);

function printBoldText(text: string) {
  console.log(`%c${text}`, "font-weight:bold");
}

function printSchema() {
  printBoldText("========== GRAPHQL SCHEMA ==========");
  console.log(schemaTypes + "\n");
  console.log(schemaInputTypes + "\n");
  console.log(schemaQueries + "\n");
  console.log(schemaMutations);
  printBoldText("====================================");
}

printSchema();
const typeDefs = gql`
  ${schemaTypes}
  ${schemaInputTypes}
  ${schemaQueries}
  ${schemaMutations}
`;

const resolvers = {
  Query: schemaQueryResolvers,
  Mutation: schemaMutationResolvers,
};

const app = new Application();

const GraphQLService = await applyGraphQL<Router>({
  Router,
  path: "/graphql",
  typeDefs: typeDefs,
  resolvers: resolvers,
  context: (context: RouterContext) => context,
});

app.use(async (_, next) => {
  await next();
});

app.use(GraphQLService.routes());

await app.listen({ port: 4000 });
