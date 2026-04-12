"use client";

import { useState, useTransition } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", mx: 2 }} elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Reset password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your account email and we&apos;ll send you a reset link.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {sent ? (
            <Alert severity="success">
              Check your email for a password reset link.
            </Alert>
          ) : (
            <Box component="form" action={handleSubmit} noValidate>
              <TextField
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                required
                fullWidth
                sx={{ mb: 3 }}
                disabled={isPending}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isPending}
                sx={{ mb: 2 }}
              >
                {isPending ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Send reset link"
                )}
              </Button>
            </Box>
          )}

          <Typography variant="body2" align="center" sx={{ mt: sent ? 2 : 0 }}>
            <Link component={NextLink} href="/login" variant="body2">
              Back to sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
