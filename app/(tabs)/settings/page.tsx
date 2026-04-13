import React from "react";
import Box from "@mui/material/Box";
import { getCurrentUser, getUserSettings } from "@/app/actions/user";
import { Divider, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import MasterKeyForm from "@/app/(tabs)/settings/components/MasterKeyForm";
import JQLQueryForm from "@/app/(tabs)/settings/components/JQLQueryForm";
import ResetForm from "@/app/(tabs)/settings/components/ResetForm";
import TicketForm from "@/app/(tabs)/settings/components/TicketForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const settings = user ? await getUserSettings(user.id) : null;

  if (!user || !settings) return <Box>Error loading settings.</Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Stack>
        <Typography
          sx={{ fontWeight: "bold" }}
          variant={"h6"}
          gutterBottom
        >
          Settings
        </Typography>
        <Divider sx={{ my: 1 }} />
        <MasterKeyForm
          key={`master-${settings.updated_at}`}
          userId={user.id}
          userEmail={user.email ?? ""}
          initialSettings={settings}
        />
        <Divider sx={{ my: 1 }} />
        <JQLQueryForm
          key={`jql-${settings.updated_at}`}
          userId={user.id}
          initialSettings={settings}
        />
        <Divider sx={{ my: 1 }} />
        <TicketForm
          key={`ticket-${settings.updated_at}`}
          userId={user.id}
          initialSettings={settings}
        />
        <Divider sx={{ my: 1 }} />
        <ResetForm userId={user.id} />
      </Stack>
    </Box>
  );
}
