const defaultMailContent = `Daily report %{CURRENT_DATE}.

Today I've been working on tickets:%{TODAY_TICKET_KEY}

Next working day:%{TOMORROW_TICKET_KEY}

Best Regards,
%{name}`;

const defaultTicketTemplate = `
	[%{key}] - %{summary}`;

const defaultQuery =
    "AND status!=Closed AND status!=Testing order by key DESC",
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
