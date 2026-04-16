"use client";

import React, { useState, useTransition } from "react";
import IOSSwitch from "@/app/components/ui/IOSSwitch";
import { FormControlLabel, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import { UserSettings } from "@/app/models/user";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { updateUserSettings } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import ApiIcon from "@mui/icons-material/Api";
import { useToast } from "@/app/components/ui/ToastProvider";

interface Props {
  userId: string;
  userEmail: string;
  initialSettings: UserSettings;
}

const MasterKeyForm: React.FC<Props> = ({
  userId,
  userEmail,
  initialSettings,
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [enabled, setEnabled] = useState(
    initialSettings?.is_using_master_key,
  );
  const [apiKey, setApiKey] = useState(initialSettings.api_key);
  const [isPending, startTransition] = useTransition();

  const hasChanges =
    enabled !== initialSettings?.is_using_master_key ||
    apiKey !== initialSettings.api_key;

  const handleSubmit = (formData: FormData) => {
    const isUsingMasterKey =
      formData.get("is_using_master_key") === "true";
    const apiKey = formData.get("api_key") as string;

    startTransition(async () => {
      const result = await updateUserSettings(userId, {
        is_using_master_key: isUsingMasterKey,
        api_key: isUsingMasterKey ? "" : apiKey,
      });

      if (!result) {
        showToast(
          "Failed to save API configuration. Please try again.",
          "error",
        );
      } else {
        showToast("API configuration saved.", "success");
        router.refresh();
      }
    });
  };

  return (
    <Box component="form" action={handleSubmit} noValidate>
      <Stack direction="row" sx={{ gap: 1, marginBottom: 2 }}>
        <ApiIcon color="primary" />
        <Typography color="primary" sx={{ fontWeight: "bold" }}>
          API Configuration
        </Typography>
      </Stack>

      <Typography>
        Enable using master credentials to retrieve Jira data.
      </Typography>
      <FormControlLabel
        control={
          <IOSSwitch
            sx={{ m: 1 }}
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
        }
        label="Use master API key"
      />
      <input
        type="hidden"
        name="is_using_master_key"
        value={enabled ? "true" : "false"}
      />

      {!enabled ? (
        <>
          <Box sx={{ pb: 1 }} />
          <Typography variant={"subtitle2"} gutterBottom>
            {"Email: " + userEmail}
          </Typography>
          <Box sx={{ paddingY: 1 }}>
            <TextField
              label="API Key"
              name="api_key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              fullWidth
              required
              disabled={isPending}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            Your API key is encrypted with AES-256-GCM before being stored
            — it is never saved in plaintext and cannot be read by anyone
            without the server-side secret.
          </Typography>
          <input type="hidden" name="api_key" value={apiKey} />
        </>
      ) : null}

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

export default MasterKeyForm;
