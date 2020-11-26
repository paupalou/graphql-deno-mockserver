import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import Schema from "./parser.ts";
import { SchemaTypes } from "../types.ts";

import { userType } from "../test.helpers.ts";

Deno.test(
  "TypesParser::parseType returns correct TypeDefinitions",
  () => {
    const schema = {
      types: [
        userType,
        { name: "Session", fields: { token: "String" } },
      ],
    };

    const parsed = Schema(schema).parseType(SchemaTypes.TypeDefinitions);
    const expected =
      "type User {\n  _id: ID\n  username: String\n  password: String\n}\n" +
      "type Session {\n  token: String\n}";

    assertEquals(parsed, expected);
  },
);

Deno.test(
  "TypesParser::parseType returns correct InputTypeDefinitions",
  () => {
    const schema = {
      types: [userType],
      inputs: [
        {
          name: "LoginInput",
          fields: { username: "String", password: "String" },
        },
        {
          name: "CreateBookingInput",
          fields: {
            bookingPax: "String",
            bookingDate: "String",
            bookingUser: "User",
          },
        },
      ],
    };

    const parsed = Schema(schema).parseType(SchemaTypes.InputTypeDefinitions);
    const expected =
      "input LoginInput {\n  username: String\n  password: String\n}\n" +
      "input CreateBookingInput {\n  bookingPax: String\n  bookingDate: String\n  bookingUser: User\n}";

    assertEquals(parsed, expected);
  },
);

Deno.test(
  "TypesParser::parseType returns correct Query",
  () => {
    const schema = {
      types: [userType],
      queries: [
        {
          operation: "testQuery",
          typeDef: "testQuery()",
          return: "[User]",
          response: [
            { username: "test1!", password: "test1!" },
            { username: "test2!", password: "test2!" },
          ],
        },
      ],
    };

    const parsed = Schema(schema).parseType(SchemaTypes.Queries);
    const expected = "type Query {\n  testQuery(): [User]\n}";

    assertEquals(parsed, expected);
  },
);

Deno.test(
  "TypesParser::parseType returns correct Mutation",
  () => {
    const schema = {
      types: [userType],
      mutations: [
        {
          operation: "testMutation",
          typeDef: "testMutation(userId: ID)",
          return: "User",
          response: { username: "test1!", password: "test1!" },
        },
      ],
    };

    const parsed = Schema(schema).parseType(SchemaTypes.Mutations);
    const expected = "type Mutation {\n  testMutation(userId: ID): User\n}";

    assertEquals(parsed, expected);
  },
);

Deno.test(
  "TypesParser::parseType can handle multiple queries",
  () => {
    const schema = {
      types: [userType],
      queries: [
        {
          operation: "testQuery",
          typeDef: "testQuery()",
          return: "[User]",
          response: [
            { username: "test1!", password: "test1!" },
            { username: "test2!", password: "test2!" },
          ],
        },
        {
          operation: "testGetUser",
          typeDef: "testGetUser(id: ID)",
          return: "User",
          responses: [
            {
              matches: { id: 1005 },
              response: {
                user: {
                  username: "test1005!",
                  password: "test1005!",
                },
              },
            },
          ],
        },
      ],
    };

    const parsed = Schema(schema).parseType(SchemaTypes.Queries);
    const expected =
      "type Query {\n  testQuery(): [User]\n  testGetUser(id: ID): User\n}";

    assertEquals(parsed, expected);
  },
);
