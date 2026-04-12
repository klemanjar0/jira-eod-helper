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
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { resetPassword } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.replace("/");
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
            Set new password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your new password below.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" action={handleSubmit} noValidate>
            <TextField
              name="newPassword"
              label="New password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              fullWidth
              sx={{ mb: 2 }}
              disabled={isPending}
              slotProps={{
                htmlInput: { minLength: 6 },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              name="confirmPassword"
              label="Confirm new password"
              type={showPassword ? "text" : "password"}
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
                "Update password"
              )}
            </Button>
          </Box>

          <Typography variant="body2" align="center">
            <Link component={NextLink} href="/login" variant="body2">
              Back to sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
