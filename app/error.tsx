"use client";

import { useEffect } from "react";
import { Box, Button, Alert, Typography } from "@mui/material";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Alert severity="error" sx={{ mb: 2, width: "100%", maxWidth: 480 }}>
        <Typography variant="h6" gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body2">{error.message}</Typography>
        {error.digest && (
          <Typography variant="caption" color="text.secondary">
            Error ID: {error.digest}
          </Typography>
        )}
      </Alert>
      <Button variant="contained" onClick={reset} sx={{ maxWidth: 480, width: "100%" }}>
        Try again
      </Button>
    </Box>
  );
}
