import { RawTicket, Ticket } from "@/app/models/ticket";
import { UserSettings } from "@/app/models/user";
import { escape } from "node:querystring";

export const TODAY_TICKET_KEY = "TODAY_TICKET_KEY";
export const TOMORROW_TICKET_KEY = "TOMORROW_TICKET_KEY";
export const CURRENT_DATE = "CURRENT_DATE";

export const transformTickets = (issues: RawTicket[]): Ticket[] => {
  const transformed: Ticket[] = issues.map(
    (issue: RawTicket): Ticket => ({
      id: issue.id,
      key: issue.key ?? "",
      summary: issue.fields?.summary ?? "",
      status: issue.fields?.status?.name ?? "",
      link: issue.self ?? "",
      priority: issue.fields?.priority?.name ?? "",
      assignee: issue.fields?.assignee?.displayName ?? "",
      type: issue.fields?.issuetype?.name ?? "",
      self: issue.self ?? "",
    }),
  );

  return transformed;
};

interface EmailURIPayload {
  today: Ticket[];
  tomorrow: Ticket[];
  date: string;
  template: UserSettings;
}

export const insertVariables = (
  value: string,
  variables: Record<PropertyKey, Anything> = {},
): string => {
  let result = value.toString();

  Object.entries(variables).forEach(([key, value]) => {
    if (result.includes(`%{${key}}`)) {
      result = result.split(`%{${key}}`).join(value);
    }
  });

  return result;
};

export const formatTickets = (
  tickets: Ticket[],
  ticketItemTemplate: string,
): string => {
  return tickets
    .map((ticket) =>
      insertVariables(ticketItemTemplate, {
        key: ticket.key ?? "",
        summary: ticket.summary ?? "",
      }),
    )
    .join("");
};

export const formatTemplate = (
  template: UserSettings,
  variables: Record<PropertyKey, Anything> = {},
) => {
  const href = "mailto:%{recipient}?subject=%{subject}&body=";
  return {
    href: insertVariables(href, variables),
    body: insertVariables(template.content_template, variables),
    all: insertVariables(href + template.content_template, variables),
  };
};

export const buildEmailURI = (payload: EmailURIPayload) => {
  const itemTemplate = payload.template.ticket_item_template;

  const today = formatTickets(payload.today, itemTemplate);
  const tomorrow = formatTickets(payload.tomorrow, itemTemplate);

  const result = formatTemplate(payload.template, {
    name: payload.template.username,
    recipient: payload.template.mail_recipient,
    subject: payload.template.mail_subject,
    [TODAY_TICKET_KEY]: today,
    [TOMORROW_TICKET_KEY]: tomorrow,
    [CURRENT_DATE]: payload.date,
  });

  return {
    encoded: result.href + encodeURIComponent(result.body),
    result,
  };
};

export const escapedForJira = (value?: string) => {
  if (!value) return "";

  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  //const escaped: string = encodeURIComponent(value.trim());

  //return escaped.replace(/%/gi, "\\\\u0025");
};
