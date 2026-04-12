"use client";

import React, { useState, useTransition } from "react";
import { UserSettings } from "@/app/models/user";
import { updateUserSettings } from "@/app/actions/user";
import Button from "@mui/material/Button";
import { Box, Stack, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";

interface Props {
  userId: string;
  initialSettings: UserSettings;
}

const JQLQueryForm: React.FC<Props> = ({ userId, initialSettings }) => {
  const router = useRouter();
  const [jql, setJql] = useState(initialSettings.issue_query);
  const [assignee, setAssignee] = useState(initialSettings.assignee);
  const [isPending, startTransition] = useTransition();

  const hasChanges =
    jql !== initialSettings.issue_query ||
    assignee !== initialSettings.assignee;

  const handleSubmit = (formData: FormData) => {
    const jql_query = formData.get("jql_query") as string;
    const assignee_query = formData.get("assignee_query") as string;

    startTransition(async () => {
      await updateUserSettings(userId, {
        ...initialSettings,
        issue_query: jql_query,
        assignee: assignee_query,
      });
      router.refresh();
    });
  };

  return (
    <Box component="form" action={handleSubmit} noValidate>
      <Stack direction="row" sx={{ gap: 1, marginBottom: 2 }}>
        <SpellcheckIcon color="primary" />
        <Typography color="primary" sx={{ fontWeight: "bold" }}>
          JQL Query Configuration
        </Typography>
      </Stack>

      <Box sx={{ paddingY: 1 }}>
        <TextField
          label="JQL Query"
          name="jql_query_field"
          value={jql}
          onChange={(e) => setJql(e.target.value)}
          fullWidth
          disabled={isPending}
        />
        <Typography
          sx={{ fontWeight: "bold", color: "gray" }}
          variant="caption"
          color="text.secondary"
          gutterBottom
        >
          Example: AND status!=Closed AND status!=Testing order by key DESC
        </Typography>
        <input type="hidden" name="jql_query" value={jql} />
      </Box>

      <Box sx={{ paddingY: 1 }}>
        <TextField
          label="JQL Assignee"
          name="jql_assignee_field"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          fullWidth
          disabled={isPending}
        />
        <Typography
          sx={{ fontWeight: "bold", color: "gray" }}
          variant="caption"
          color="text.secondary"
          gutterBottom
        >
          Example: AND assignee = currentUser()
        </Typography>
        <input type="hidden" name="assignee_query" value={assignee} />
      </Box>

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

export default JQLQueryForm;
