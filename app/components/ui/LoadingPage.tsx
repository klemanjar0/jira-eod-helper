import React, { PropsWithChildren } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

type Props = {
  label?: string;
};
export default function LoadingPage({
  children,
  label,
}: PropsWithChildren<Props>) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        gap: 2,
      }}
    >
      {label ? (
        <Typography color="primary" sx={{ fontWeight: "bold" }}>
          {label}
        </Typography>
      ) : null}
      <CircularProgress />
      {children}
    </Box>
  );
}
