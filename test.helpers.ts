import { BufReader, BufWriter } from "https://deno.land/std/io/bufio.ts";
import { Context } from "https://deno.land/x/oak@v6.2.0/context.ts";

import type {
  Application,
  State,
} from "https://deno.land/x/oak@v6.2.0/application.ts";
import type { ServerRequest } from "https://deno.land/x/oak@v6.2.0/types.d.ts";

export const userType = Object.freeze({
  name: "User",
  fields: { _id: "ID", username: "String", password: "String" },
});

interface MockServerOptions {
  headers?: Record<string, string>;
  proto?: string;
  url?: string;
}

// deno-lint-ignore no-explicit-any
function createMockApp<S extends State = Record<string, any>>(
  state = {} as S,
): Application<S> {
  return {
    state,
    dispatchEvent() {},
    // deno-lint-ignore no-explicit-any
  } as any;
}

function createMockServerRequest(
  {
    url = "/",
    proto = "HTTP/1.1",
    headers: headersInit = { host: "localhost" },
  }: MockServerOptions = {},
): ServerRequest {
  const headers = new Headers(headersInit);
  return {
    conn: {
      close() {},
    },
    r: new BufReader(new Deno.Buffer(new Uint8Array())),
    w: new BufWriter(new Deno.Buffer(new Uint8Array())),
    headers,
    method: "GET",
    proto,
    url,
    async respond() {},
    // deno-lint-ignore no-explicit-any
  } as any;
}

export const mockContext = new Context(
  createMockApp(),
  createMockServerRequest(),
);
