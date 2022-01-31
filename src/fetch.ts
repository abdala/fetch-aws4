import { FetchFunction, V4FetchFunction, V4RequestInit } from "./types";
import aws4, { Request } from "aws4";
import { RequestInfo, Response } from "node-fetch";
import originalFetch from "node-fetch";
const { sign } = aws4;

const normalizeHeaders = (signedOptions?: Request) => {
  const normalizedHeaders: Record<string, string> = {};
  for (const key in signedOptions?.headers) {
    normalizedHeaders[key] = String(signedOptions?.headers[key]);
  }
  return normalizedHeaders;
};

export const wrapper = (fetch: FetchFunction): V4FetchFunction => {
  return async (url: RequestInfo, init?: V4RequestInit): Promise<Response> => {
    if (
      !init?.credentials &&
      !process.env.AWS_ACCESS_KEY_ID &&
      !process.env.AWS_SECRET_ACCESS_KEY
    ) {
      throw new Error("Credentials not defined.");
    }

    const parsedUrl = new URL(url.toString());
    const match = /([^.]+)\.(?:([^.]*)\.)?amazonaws\.com(\.cn)?$/.exec(
      parsedUrl.host
    );

    const agent = init?.agent;

    let options = {
      ...init,
      headers: { ...init?.headers },
      agent:
        typeof init?.agent === "function"
          ? init?.agent(parsedUrl)
          : init?.agent,
      host: parsedUrl.host,
      path: parsedUrl.pathname + parsedUrl.search,
    };

    if (!init?.service && !match) {
      options = { ...options, service: "execute-api" };
    }

    const signedOptions = sign(options, init?.credentials);

    return fetch(url, {
      ...signedOptions,
      agent,
      port: signedOptions?.port ? Number(signedOptions?.port) : undefined,
      protocol:
        signedOptions?.protocol === null ? undefined : signedOptions?.protocol,
      headers: normalizeHeaders(signedOptions),
    });
  };
};

export default wrapper(originalFetch);
