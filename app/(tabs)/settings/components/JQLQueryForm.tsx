"use client";

import React, { useState, useTransition } from "react";
import { UserSettings } from "@/app/models/user";
import { updateUserSettings } from "@/app/actions/user";
import Button from "@mui/material/Button";
import { Box, FormControlLabel, Stack, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import IOSSwitch from "@/app/components/ui/IOSSwitch";
import JQLSearchField from "@/app/(tabs)/settings/components/JQLSearchField";
import { useToast } from "@/app/components/ui/ToastProvider";

interface Props {
  userId: string;
  initialSettings: UserSettings;
}

const JQLQueryForm: React.FC<Props> = ({ userId, initialSettings }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [jql, setJql] = useState(initialSettings.issue_query);
  const [useCurrentUser, _setUseCurrentUser] = useState<boolean>(
    initialSettings.assignee_is_current_user,
  );
  const [assignee, setAssignee] = useState(initialSettings.assignee);
  const [isPending, startTransition] = useTransition();

  const setUseCurrentUser = (value: boolean) => {
    _setUseCurrentUser(value);

    if (!value) {
      setAssignee(initialSettings.assignee);
    }
  };

  const hasChanges =
    jql !== initialSettings.issue_query ||
    assignee !== initialSettings.assignee ||
    useCurrentUser !== initialSettings.assignee_is_current_user;

  const handleSubmit = (formData: FormData) => {
    const jql_query = formData.get("jql_query") as string;
    const assignee_query = formData.get("assignee_query") as string;
    const is_using_current_user =
      formData.get("is_using_current_user") === "true";

    startTransition(async () => {
      const result = await updateUserSettings(userId, {
        ...initialSettings,
        issue_query: jql_query,
        assignee: assignee_query,
        assignee_is_current_user: is_using_current_user,
      });

      if (!result) {
        showToast(
          "Failed to save JQL configuration. Please try again.",
          "error",
        );
      } else {
        showToast("JQL configuration saved.", "success");
        router.refresh();
      }
    });
  };

  return (
    <Box component="form" action={handleSubmit} noValidate>
      <Stack direction="row" sx={{ gap: 1, marginBottom: 1 }}>
        <SpellcheckIcon color="primary" />
        <Typography color="primary" sx={{ fontWeight: "bold" }}>
          JQL Query Configuration
        </Typography>
      </Stack>

      <Box sx={{ paddingY: 1 }}>
        <JQLSearchField value={jql} onChange={setJql} />
        <input type="hidden" name="jql_query" value={jql} />
      </Box>

      <Box sx={{ paddingY: 1 }}>
        <FormControlLabel
          control={
            <IOSSwitch
              sx={{ m: 1 }}
              checked={useCurrentUser}
              onChange={(e) => setUseCurrentUser(e.target.checked)}
            />
          }
          label="Use Current User"
          sx={{ mb: 2 }}
        />
        <input
          type="hidden"
          name="is_using_current_user"
          value={useCurrentUser ? "true" : "false"}
        />
        <TextField
          label="JQL Assignee"
          name="jql_assignee_field"
          value={useCurrentUser ? "Current User" : assignee}
          onChange={(e) => setAssignee(e.target.value)}
          fullWidth
          disabled={isPending || useCurrentUser}
        />
        <Typography
          sx={{ fontWeight: "bold", color: "gray" }}
          variant="caption"
          color="text.secondary"
          gutterBottom
        >
          Example: Ivan Ivanov (if current user is on, then currentUser()
          will be applied)
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
