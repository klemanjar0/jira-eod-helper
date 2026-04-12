import React from "react";
import Box from "@mui/material/Box";
import { Divider, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { getCurrentUser } from "@/app/actions/user";
import { logout } from "@/app/actions/auth";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) return <Box sx={{ p: 2 }}>Not signed in.</Box>;

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleString()
    : "—";
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : "—";

  return (
    <Box sx={{ p: 2 }}>
      <Stack>
        <Typography sx={{ fontWeight: "bold" }} gutterBottom>
          Account
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Stack spacing={1} sx={{ py: 1 }}>
          <Field label="Email" value={user.email ?? "—"} />
          <Field label="User ID" value={user.id} />
          <Field label="Created" value={createdAt} />
          <Field label="Last sign in" value={lastSignIn} />
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Typography sx={{ fontWeight: "bold", mt: 1 }} gutterBottom>
          Change password
        </Typography>
        <ChangePasswordForm />

        <Divider sx={{ my: 2 }} />

        <Box component="form" action={logout}>
          <Button
            type="submit"
            fullWidth
            variant="outlined"
            color="error"
          >
            Log out
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ wordBreak: "break-all" }}
      >
        {value}
      </Typography>
    </Box>
  );
}
