"use client";

import { useState, useTransition } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { changePassword } from "@/app/actions/auth";

export default function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await changePassword(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        (
          document.getElementById(
            "change-password-form",
          ) as HTMLFormElement
        )?.reset();
      }
    });
  };

  return (
    <Box
      id="change-password-form"
      component="form"
      action={handleSubmit}
      noValidate
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Password updated successfully.
        </Alert>
      )}

      <TextField
        size="small"
        name="currentPassword"
        label="Current password"
        type={showCurrent ? "text" : "password"}
        required
        fullWidth
        sx={{ mb: 2 }}
        disabled={isPending}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrent(!showCurrent)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                  size="small"
                >
                  {showCurrent ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        size="small"
        name="newPassword"
        label="New password"
        type={showNew ? "text" : "password"}
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
                  onClick={() => setShowNew(!showNew)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                  size="small"
                >
                  {showNew ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        size="small"
        name="confirmPassword"
        label="Confirm new password"
        type={showNew ? "text" : "password"}
        required
        fullWidth
        sx={{ mb: 2 }}
        disabled={isPending}
      />

      <Button
        type="submit"
        variant="outlined"
        fullWidth
        disabled={isPending}
      >
        {isPending ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          "Change password"
        )}
      </Button>
    </Box>
  );
}
