import { Context } from "https://deno.land/x/oak@v6.2.0/context.ts";

import type { MockedMatchingResponse, MockedOperation, MockedResponse } from "../types.ts";

function authorizationHeaderMatch(
  context: Context,
  response: MockedMatchingResponse,
): boolean {
  if (!response.headers) {
    return true;
  }

  const { headers } = context.request;
  const authorizationHeader = headers.get("Authorization")?.trim() ?? "";

  if (response.headers["authorization"] === authorizationHeader) {
    return true;
  }

  if (response.headers["Authorization"] === authorizationHeader) {
    return true;
  }

  return false;
}

function allInputParamsMatch(
  response: MockedMatchingResponse,
  inputParams: Record<string, unknown> = {},
): boolean {
  const { params } = response;
  if (!params) {
    return true;
  }

  return Object.keys(params)
    .every(
      (param) => params && inputParams[param] === params[param],
    );
}

export function getMatchinResponse(
  query: MockedOperation,
  context: Context,
  inputParams?: Record<string, unknown>,
): MockedResponse | undefined {
  if (typeof query.possibleResponses === "undefined") {
    return;
  }

  const matchingResponse = query.possibleResponses.find(
    (res) => {
      if (!authorizationHeaderMatch(context, res)) {
        return false;
      }

      if (allInputParamsMatch(res, inputParams)) {
        return true;
      }
    },
  );

  return matchingResponse?.response;
}
