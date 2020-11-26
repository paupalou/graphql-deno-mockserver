import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { mockContext } from "../test.helpers.ts";
import { getMatchinResponse } from "./helpers.ts";

import type { MockedOperation } from "../types.ts";

Deno.test(
  "Helpers::GetMatchinResponse returns undefined if schema does not have responses",
  () => {
  const mockedQuery: MockedOperation = {
    operation: "QueryOperation",
    typeDef: "QueryOperation()",
    return: "String",
  };

  const response = getMatchinResponse(mockedQuery, mockContext);

  assertEquals(response, undefined);
});

Deno.test(
  "Helpers::GetMatchinResponse returns undefined if schema have empty responses array",
  () => {
  const mockedQuery: MockedOperation = {
    operation: "QueryOperation",
    typeDef: "QueryOperation()",
    return: "String",
    possibleResponses: [],
  };

  const response = getMatchinResponse(mockedQuery, mockContext);
  assertEquals(response, undefined);
});

Deno.test(
  "Helpers::GetMatchinResponse returns correct response depending on Authorization header",
  () => {
    const mockedQuery: MockedOperation = {
      operation: "QueryOperation",
      typeDef: "queryOperation()",
      return: "String",
      possibleResponses: [
        {
          headers: { Authorization: "Basic tokentest" },
          response: "GreenResponse!",
        },
        {
          headers: { authorization: "UnderCase tokentest" },
          response: "UnderCaseTokenGreenResponse!",
        },
      ],
    };

  const context = mockContext
  context.request.headers.set("Authorization", "Basic tokentest")
  let response = getMatchinResponse(mockedQuery, context);
  assertEquals(response, "GreenResponse!");

  context.request.headers.set("Authorization", "UnderCase tokentest")
  response = getMatchinResponse(mockedQuery, context);
  assertEquals(response, "UnderCaseTokenGreenResponse!");
});
