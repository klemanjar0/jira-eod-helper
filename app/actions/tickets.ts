"use server";

import {
  buildJiraAuth,
  getCurrentUser,
  getUserSettings,
} from "@/app/actions/user";
import {
  RawTicket,
  TicketDetails,
  TicketComment,
  TicketResponse,
} from "@/app/models/ticket";
import { buildRequestOptions, callApi } from "@/app/lib/api";
import { log } from "@/app/lib/logger";
import { escapedForJira, transformTickets } from "@/app/lib/utils";
import { escape } from "node:querystring";

const JIRA_FIELDS = [
  "assignee",
  "summary",
  "status",
  "priority",
  "issuetype",
];
const JIRA_PAGE_SIZE = 100;
const JIRA_MAX_PAGES = 50; // hard safety cap: 50 * 100 = 5000 issues

export async function getTickets(query?: string): Promise<TicketResponse> {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const userSettings = await getUserSettings(user.id);
  if (!userSettings) throw new Error("User settings not found");

  const {
    project_id: projectId,
    issue_query: issueQuery,
    assignee,
  } = userSettings;
  if (!projectId) throw new Error("Project ID is not set");

  const jqlArray = [`project=${projectId}`];
  if (query) {
    const escaped = escapedForJira(query);
    jqlArray.push(`AND (key ~ "${escaped}" OR summary ~ "${escaped}")`);
  }

  const assignTo = `AND assignee="${escapedForJira(assignee)}"`;

  jqlArray.push(assignTo, escapedForJira(issueQuery));

  const jql = jqlArray.filter(Boolean).join(" ");

  const authString = await buildJiraAuth();
  if (!authString) throw new Error("Failed to build Jira auth header");

  log.debug("jira", "getTickets: start", { userId: user.id, jql });

  const allIssues: RawTicket[] = [];
  let nextPageToken: string | undefined = undefined;
  let pageCount = 0;
  let lastPageIsLast = false;

  do {
    pageCount++;

    const req = buildRequestOptions("rest/api/3/search/jql", {
      method: "POST",
      authHeader: authString,
      body: {
        jql,
        fields: JIRA_FIELDS,
        maxResults: JIRA_PAGE_SIZE,
        ...(nextPageToken ? { nextPageToken } : {}),
      },
    });

    const res = await callApi(req);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      log.error("jira", "getTickets: HTTP error", {
        status: res.status,
        page: pageCount,
        body: text.slice(0, 500),
      });
      throw new Error(`Jira responded ${res.status}`);
    }

    let page: TicketResponse;
    try {
      page = (await res.json()) as TicketResponse;
    } catch (e) {
      log.error("jira", "getTickets: failed to parse JSON", {
        page: pageCount,
        message: e instanceof Error ? e.message : String(e),
      });
      throw new Error("Failed to parse Jira response");
    }

    const pageIssues = page.issues ?? [];
    allIssues.push(...pageIssues);
    nextPageToken = page.nextPageToken;
    lastPageIsLast = page.isLast;

    log.debug("jira", "getTickets: page fetched", {
      page: pageCount,
      received: pageIssues.length,
      total: allIssues.length,
      isLast: lastPageIsLast,
      hasNextToken: !!nextPageToken,
    });

    if (lastPageIsLast) break;

    if (pageCount >= JIRA_MAX_PAGES) {
      log.warn("jira", "getTickets: hit page safety cap", {
        page: pageCount,
        total: allIssues.length,
      });
      break;
    }
  } while (nextPageToken);

  log.info("jira", "getTickets: ok", {
    userId: user.id,
    pages: pageCount,
    total: allIssues.length,
  });

  const result = transformTickets(allIssues);

  return {
    issues: allIssues,
    tickets: result,
    isLast: lastPageIsLast || !nextPageToken,
  };
}

const DETAIL_FIELDS = [
  "assignee",
  "summary",
  "status",
  "priority",
  "issuetype",
  "description",
  "labels",
  "timespent",
  "comment",
];

function formatTimeSpent(seconds: number | null): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractDescription(field: any): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  // ADF (Atlassian Document Format) — extract text nodes recursively
  if (field.content) {
    return extractAdfText(field);
  }
  return String(field);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractAdfText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (!Array.isArray(node.content)) return "";
  return node.content
    .map((child: Record<string, unknown>) => extractAdfText(child))
    .join(node.type === "paragraph" ? "\n" : "");
}

export async function getTicketDetails(
  issueKey: string,
): Promise<TicketDetails | null> {
  if (!issueKey || typeof issueKey !== "string") {
    log.warn("jira", "getTicketDetails: invalid issueKey", {
      issueKey: String(issueKey),
    });
    return null;
  }

  const authString = await buildJiraAuth();
  if (!authString) {
    log.warn("jira", "getTicketDetails: no auth");
    return null;
  }

  log.debug("jira", "getTicketDetails: start", { issueKey });

  const req = buildRequestOptions(
    `rest/api/3/issue/${encodeURIComponent(issueKey)}`,
    {
      method: "GET",
      authHeader: authString,
      query: new URLSearchParams({ fields: DETAIL_FIELDS.join(",") }),
    },
  );

  const res = await callApi(req);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    log.error("jira", "getTicketDetails: HTTP error", {
      issueKey,
      status: res.status,
      body: text.slice(0, 500),
    });
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let raw: any;
  try {
    raw = await res.json();
  } catch (e) {
    log.error("jira", "getTicketDetails: JSON parse failed", {
      issueKey,
      message: e instanceof Error ? e.message : String(e),
    });
    return null;
  }

  const fields = raw.fields ?? {};

  const comments: TicketComment[] = (fields.comment?.comments ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => ({
      id: c.id ?? "",
      author: c.author?.displayName ?? c.author?.name ?? "Unknown",
      body: extractDescription(c.body),
      created: c.created ?? "",
    }),
  );

  log.debug("jira", "getTicketDetails: ok", {
    issueKey,
    comments: comments.length,
  });

  return {
    id: raw.id ?? "",
    key: raw.key ?? "",
    summary: fields.summary ?? "",
    status: fields.status?.name ?? "",
    priority: fields.priority?.name ?? "",
    assignee: fields.assignee?.displayName ?? "Unassigned",
    type: fields.issuetype?.name ?? "",
    description: extractDescription(fields.description),
    labels: fields.labels ?? [],
    timeSpent: formatTimeSpent(fields.timespent),
    comments,
  };
}
