import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

import Schema from "./parser.ts";
import { userType, mockContext } from "../test.helpers.ts";
import { SchemaResolvers } from "../types.ts";

Deno.test(
  "ResolversParser::parseResolver query resolver returns expected response",
  () => {
    const schema = {
      types: [ userType ],
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

    const parsed = Schema(schema).parseResolver(SchemaResolvers.Query);
    assert(typeof parsed !== "undefined");

    const queryResolver = parsed["testQuery"];
    const response: {
      username: string;
      password: string;
    }[] = queryResolver(undefined, {}, mockContext);

    assertEquals(response.length, 2);
    assertEquals(response[0].username, "test1!");
    assertEquals(response[1].username, "test2!");
  }
);

Deno.test(
  "ResolversParser::parseResolver query resolver finds response that match headers",
  () => {
  const schema = {
    types: [ userType ],
    queries: [
      {
        operation: "testQuery",
        typeDef: "testQuery()",
        return: "[User]",
        possibleResponses: [
          {
            headers: { authorization: "Basic tokentest" },
            response: {
              username: "authorizedUser",
              password: "authorizedUser!",
            },
          },
          {
            response: {
              username: "guestUser",
              password: "gestUser!",
            },
          },
        ],
      },
    ],
  };

  const parsed = Schema(schema).parseResolver(SchemaResolvers.Query);
  assert(typeof parsed !== "undefined");

  const context = mockContext;
  context.request.headers.set("Authorization", "Basic tokentest");

  const queryResolver = parsed["testQuery"];
  const response: {
    username: string;
    password: string;
  } = queryResolver(undefined, {}, context);

  assertEquals(response.username, "authorizedUser");
  assertEquals(response.password, "authorizedUser!");
});

Deno.test(
  "ResolversParser::parseResolver query resolver can handle multiple queries",
  () => {
    const schema = {
      types: [ userType ],
      queries: [
        {
          operation: "testQuery",
          typeDef: "testQuery()",
          return: "[User]",
          possibleResponses: [
            {
              headers: { authorization: "Basic tokentest" },
              response: {
                username: "authorizedUser",
                password: "authorizedUser!",
              },
            },
            {
              response: {
                username: "guestUser",
                password: "gestUser!",
              },
            },
          ],
        },
        {
          operation: "greetings",
          typeDef: "greetings(to: String)",
          return: "String",
          possibleResponses: [
            { params: { to: "Pau" }, response: "Hello Pau" },
            { params: { to: "Olivia" }, response: "Hello Olivia" },
          ],
        },
      ],
    };

    const parsed = Schema(schema).parseResolver(SchemaResolvers.Query);
    assert(typeof parsed !== "undefined");

    const context = mockContext;
    mockContext.request.headers.set("Authorization", "Basic tokentest");

    let queryResolver = parsed["testQuery"];
    let response: {
      username: string;
      password: string;
    } = queryResolver(undefined, {}, context);

    assertEquals(response.username, "authorizedUser");
    assertEquals(response.password, "authorizedUser!");

    mockContext.request.headers.delete("Authorization");
    queryResolver = parsed["greetings"];
    response = queryResolver(undefined, { to: "Olivia" }, context);

    assertEquals(response, "Hello Olivia");
});

Deno.test(
  "ResolversParser::parseResolver query resolver not crash if schema does not have queries defined",
  () => {
    const schema = { types: [ userType ] };
    const parsed = Schema(schema).parseResolver(SchemaResolvers.Query);

    assert(typeof parsed !== "undefined");
});

Deno.test(
  "ResolversParser::parseResolver mutation resolver returns correct response matching header",
  () => {
    const schema = {
      types: [ userType ],
      mutations: [
        {
          operation: "login",
          typeDef: "login()",
          return: "User",
          possibleResponses: [
            {
              headers: { authorization: "Basic PauToken" },
              response: {
                id: 31337,
                username: "Pau",
                password: "password!",
              },
            },
            {
              headers: { authorization: "Basic OliviaToken" },
              response: {
                id: 5781,
                username: "Olivia",
                password: "password!",
              },
            },
          ],
        },
      ],
    };

    const parsed = Schema(schema).parseResolver(SchemaResolvers.Mutation);

    const context = mockContext;
    context.request.headers.set("Authorization", "Basic PauToken");
    const mutationResolver = parsed["login"];
    let response: {
      username: string;
      password: string;
    } = mutationResolver(undefined, {}, context);

    assertEquals(response.username, "Pau");

    context.request.headers.set("Authorization", "Basic OliviaToken");
    response = mutationResolver(undefined, {}, context);

    assertEquals(response.username, "Olivia");
  }
);

Deno.test(
  "ResolversParser::parseResolver mutation resolver returns correct response matching params",
  () => {
    const schema = {
      types: [ userType ],
      mutations: [
        {
          operation: "changePassword",
          typeDef: "changePassword(userId: ID!, newPassword: String!)",
          return: "User",
          possibleResponses: [
            {
              params: { userId: 31337, newPassword: "newPassword!" },
              response: { id: 31337, username: "Pau", password: "newPassword!" },
            },
          ],
        },
      ],
    };

    const parsed = Schema(schema).parseResolver(SchemaResolvers.Mutation);
    const context = mockContext;
    const mutationResolver = parsed["changePassword"];
    const response: { username: string; password: string } = mutationResolver(
      undefined,
      { userId: 31337, newPassword: "newPassword!" },
      context,
    );

    assertEquals(response.username, "Pau");
    assertEquals(response.password, "newPassword!");
  }
);

Deno.test(
  "ResolversParser::parseResolver mutation resolver returns correct response based on headers and/or params",
  () => {
    const schema = {
      types: [ userType ],
      queries: [],
      mutations: [
        {
          operation: "changePassword",
          typeDef: "changePassword(userId: ID, newPassword: String)",
          return: "User",
          possibleResponses: [
            {
              headers: { authorization: "Basic GoodToken" },
              params: {
                userId: 8761,
                newPassword: "securePassword!",
              },
              response: {
                username: "authorizedUser",
                password: "securePassword!",
              },
            },
            {
              params: { userId: 123, newPassword: "1234" },
              response: { username: "publicUser", password: "1234" },
            },
          ],
        },
      ],
    };

    const parsed = Schema(schema).parseResolver(SchemaResolvers.Mutation);
    assert(typeof parsed !== "undefined");

    const context = mockContext;
    context.request.headers.set("Authorization", "Basic GoodToken");

    const mutationResolver = parsed["changePassword"];
    let response: {
      username: string;
      password: string;
    } = mutationResolver(
      undefined,
      { userId: 8761, newPassword: "securePassword!" },
      context,
    );

    assertEquals(response.username, "authorizedUser");
    assertEquals(response.password, "securePassword!");

    context.request.headers.delete("Authorization");
    response = mutationResolver(
      undefined,
      { userId: 123, newPassword: "1234" },
      context,
    );

    assertEquals(response.username, "publicUser");
    assertEquals(response.password, "1234");
});
