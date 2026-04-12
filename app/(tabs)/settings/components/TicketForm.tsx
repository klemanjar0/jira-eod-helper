"use client";

import React from "react";
import { UserSettings } from "@/app/models/user";
import Box from "@mui/material/Box";
import { Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import SubjectIcon from "@mui/icons-material/Subject";
import TextField from "@mui/material/TextField";

interface Props {
  userId: string;
  initialSettings: UserSettings;
}

const TicketForm: React.FC<Props> = ({ userId, initialSettings }) => {
  const [content, setContent] = React.useState(
    initialSettings.content_template,
  );
  const [itemTemplate, setItemTemplate] = React.useState(
    initialSettings.ticket_item_template,
  );

  return (
    <Box component="form" noValidate sx={{ width: "100%" }}>
      <Stack direction="row" sx={{ gap: 1, marginBottom: 2 }}>
        <SubjectIcon color="primary" />
        <Typography color="primary" sx={{ fontWeight: "bold" }}>
          Email Template
        </Typography>
      </Stack>

      <TextField
        sx={{ marginBottom: 1 }}
        fullWidth
        id="content_template_field"
        label="Email Body Template"
        multiline
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Typography variant="body2" sx={{ marginBottom: 1 }}>
        Use TODAY_TICKET_KEY key to insert tickets list for today. Use
        TOMORROW_TICKET_KEY to insert tickets for tomorrow. Use
        CURRENT_DATE key to insert the date that has been selected in the
        field above. All other fields can be used in the template.
      </Typography>
      <input type="hidden" name="content_template" value={content} />

      <Box sx={{ paddingY: 1 }} />

      <TextField
        sx={{ marginBottom: 2 }}
        id="item_template_field"
        label="Ticket Item Template"
        value={itemTemplate}
        onChange={(e) => setItemTemplate(e.target.value)}
        multiline
        fullWidth
      />
      <input type="hidden" name="item_template" value={itemTemplate} />
    </Box>
  );
};

export default TicketForm;
