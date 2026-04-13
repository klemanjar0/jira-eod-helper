"use client";

import React, { useState, useTransition } from "react";
import { UserSettings } from "@/app/models/user";
import Box from "@mui/material/Box";
import { Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import SubjectIcon from "@mui/icons-material/Subject";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { updateUserSettings } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ui/ToastProvider";

interface Props {
  userId: string;
  initialSettings: UserSettings;
}

const TicketForm: React.FC<Props> = ({ userId, initialSettings }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [content, setContent] = useState(initialSettings.content_template);
  const [itemTemplate, setItemTemplate] = useState(
    initialSettings.ticket_item_template,
  );
  const [isPending, startTransition] = useTransition();

  const hasChanges =
    content !== initialSettings.content_template ||
    itemTemplate !== initialSettings.ticket_item_template;

  const handleSubmit = (formData: FormData) => {
    const contentTemplate = formData.get("content_template") as string;
    const ticketItemTemplate = formData.get("item_template") as string;

    startTransition(async () => {
      const result = await updateUserSettings(userId, {
        content_template: contentTemplate,
        ticket_item_template: ticketItemTemplate,
      });

      if (!result) {
        showToast(
          "Failed to save email template. Please try again.",
          "error",
        );
      } else {
        showToast("Email template saved.", "success");
        router.refresh();
      }
    });
  };

  return (
    <Box
      component="form"
      action={handleSubmit}
      noValidate
      sx={{ width: "100%" }}
    >
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
        disabled={isPending}
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
        disabled={isPending}
      />
      <input type="hidden" name="item_template" value={itemTemplate} />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isPending || !hasChanges}
        sx={{ mb: 2 }}
      >
        {isPending ? "Saving..." : "Save"}
      </Button>
    </Box>
  );
};

export default TicketForm;
