import { getServerConfig } from "@/app/lib/config";
import { log } from "@/app/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "";

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin =
    ALLOWED_ORIGIN && requestOrigin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function buildTargetUrl(request: NextRequest, path: string[]) {
  const { jiraHost } = getServerConfig();
  const jiraPath = "/" + path.join("/");
  const search = request.nextUrl.search;
  return `${jiraHost}${jiraPath}${search}`;
}

function getAuthHeaders() {
  const { masterEmail, masterApiToken } = getServerConfig();
  const token = Buffer.from(`${masterEmail}:${masterApiToken}`).toString(
    "base64",
  );
  return { Authorization: `Basic ${token}` };
}

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { jiraHost } = getServerConfig();
  if (!jiraHost) {
    log.error("proxy", "JIRA_HOST is missing in .env — proxy disabled");
    return NextResponse.json(
      {
        error: "Proxy is not configured. JIRA_HOST is missing in .env",
      },
      { status: 503 },
    );
  }

  const { path } = await params;
  const targetUrl = buildTargetUrl(request, path);
  const start = performance.now();

  log.info("proxy", `${request.method} ${targetUrl}`);

  const headers = new Headers(request.headers);
  // Remove Next.js/host headers
  headers.delete("host");
  headers.delete("connection");
  // Set Jira basic auth
  const auth = getAuthHeaders();
  headers.set("Authorization", auth.Authorization);

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });
  } catch (err) {
    const ms = (performance.now() - start).toFixed(0);
    log.error("proxy", `Upstream request failed`, {
      url: targetUrl,
      ms,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Upstream request failed" },
      { status: 502 },
    );
  }

  const ms = (performance.now() - start).toFixed(0);
  const logFn = response.ok ? log.info : log.warn;
  logFn("proxy", `${response.status} ${response.statusText}`, {
    method: request.method,
    url: "/" + path.join("/"),
    ms: `${ms}ms`,
  });

  const corsHeaders = getCorsHeaders(request.headers.get("origin"));
  const responseHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) =>
    responseHeaders.set(key, value),
  );
  // Remove transfer-encoding since Next.js handles it
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get("origin")),
  });
}
