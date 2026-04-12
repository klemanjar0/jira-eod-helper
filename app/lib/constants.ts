const defaultMailContent = `Daily report %{CURRENT_DATE}.

Today I've been working on tickets:%{TODAY_TICKET_KEY}

Next working day:%{TOMORROW_TICKET_KEY}

Best Regards,
%{name}`;

const defaultTicketTemplate = `
	[%{key}] - %{summary}`;

const defaultQuery = "status!=Closed,status!=Testing",
  defaultSubject = "Developer FE;myTI",
  defaultMailRecipient = "my.eod@trialinteractive.com",
  defaultAssignee = "AND assignee = currentUser()";

export const appConstants = {
  defaultMailContent,
  defaultTicketTemplate,
  defaultAssignee,
  defaultSubject,
  defaultMailRecipient,
  defaultQuery,
};

/** Jira priority → hex color */
export const PRIORITY_COLORS: Record<string, string> = {
  Blocker: "#FF4C4C",
  Critical: "#FF7043",
  Major: "#FFA500",
  Minor: "#1E90FF",
  Trivial: "#AAAAAA",
};
export const DEFAULT_PRIORITY_COLOR = "#777777";

/** Jira status → hex color (semi-transparent variant with 60% opacity suffix) */
export const STATUS_COLORS: Record<string, string> = {
  Resolved: "#32CD3260",
  "To Do": "#CCCCCC60",
  "In Progress": "#1E90FF60",
  Reopened: "#FF634760",
  Closed: "#228B2260",
  "Story Review": "#9370DB60",
  "In Review": "#87CEFA60",
};
export const DEFAULT_STATUS_COLOR = "#88888860";

/** Solid (fully opaque) status colors — used in detail view */
export const STATUS_COLORS_SOLID: Record<string, string> = {
  Resolved: "#32CD32",
  "To Do": "#CCCCCC",
  "In Progress": "#1E90FF",
  Reopened: "#FF6347",
  Closed: "#228B22",
  "Story Review": "#9370DB",
  "In Review": "#87CEFA",
};
export const DEFAULT_STATUS_COLOR_SOLID = "#888888";
