import React from "react";
import { getCurrentUser, getUserSettings } from "@/app/actions/user";
import Box from "@mui/material/Box";
import EmailForm from "@/app/(tabs)/email/EmailForm";

export default async function EmailPage() {
  const user = await getCurrentUser();
  const today = new Date();

  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();

  if (!user) return <Box sx={{ p: 2 }}>Not signed in.</Box>;

  const settings = await getUserSettings(user.id);

  if (!settings) return <Box sx={{ p: 2 }}>Error fetching settings</Box>;

  return (
    <EmailForm
      key={`email-form-key-${settings.updated_at}`}
      settings={settings}
      initialDate={`${yyyy}-${mm}-${dd}`}
      userId={user.id}
    />
  );
}
