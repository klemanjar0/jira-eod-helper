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

  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const finalUrl = new URL(url, base);
  if (options.query) {
    options.query.forEach((value, key) => finalUrl.searchParams.set(key, value));
  }

  const request = new Request(finalUrl.toString(), {
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

const enableNetworkDebug = process.env.NODE_ENV === "development";
export const callApi = (req: Request) => {
  if (enableNetworkDebug) {
    log.debug("callApi", req.url);
  }
  return fetch(req);
};
