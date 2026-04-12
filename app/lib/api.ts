import { log } from "@/app/lib/logger";

export type BuildRequestOptionsPayload = {
  authHeader?: string;
  query?: URLSearchParams;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, Anything>;
};

export const buildRequestOptions = (
  url: string,
  options: BuildRequestOptionsPayload = {},
) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl)
    throw new Error(
      "API URL is not set. Please set NEXT_PUBLIC_API_URL in .env.local",
    );

  let finalUrl = [baseUrl, url].join("/");
  if (options.query) finalUrl = [finalUrl, options.query].join("?");

  const request = new Request(finalUrl, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (options.authHeader)
    request.headers.append("Authorization", options.authHeader);

  return request;
};

const enableNetworkDebug = true;
export const callApi = (req: Request) => {
  if (enableNetworkDebug) {
    log.debug("callApi", req.url, {
      headers: req.headers,
      body: req.body,
    });
  }
  return fetch(req);
};
