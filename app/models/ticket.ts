export interface Ticket {
  id: string;
  key: string;
  summary: string;
  status: string;
  link: string;
  priority: string;
  assignee: string;
  type: string;
  self: string;
}

export interface TicketRequest {
  jql: string;
  startAt: number;
  maxResults: number;
}

export interface RawTicket {
  expand: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    assignee: {
      displayName: string;
    };
    priority: {
      name: string;
    };
    issuetype: {
      name: string;
    };
  };
  id: string;
  self: string;
  key: string;
}

export interface TicketResponse {
  issues: RawTicket[];
  tickets: Ticket[];
  isLast: boolean;
  nextPageToken?: string;
}

export interface TicketDetails {
  id: string;
  key: string;
  summary: string;
  status: string;
  priority: string;
  assignee: string;
  type: string;
  description: string;
  labels: string[];
  timeSpent: string;
  comments: TicketComment[];
}

export interface TicketComment {
  id: string;
  author: string;
  body: string;
  created: string;
}
