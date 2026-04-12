"use client";

import { useEffect } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TicketsError({ error, reset }: Props) {
  useEffect(() => {
    console.error("tickets error:", error);
  }, [error]);

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="h6">Oops! Something gone wrong!</Typography>
        <Typography variant="body2">{error.message}</Typography>
        {error.digest && (
          <Typography variant="caption" color="text.secondary">
            error id: {error.digest}
          </Typography>
        )}
      </Alert>

      <Button fullWidth variant="contained" onClick={reset}>
        Try again
      </Button>
    </Box>
  );
}
