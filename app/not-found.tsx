import { Box, Typography } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 2,
        p: 3,
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: "bold", fontSize: "6rem" }}>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Page not found
      </Typography>
      <Link href="/" style={{ textDecoration: "none" }}>
        <Typography
          sx={{
            px: 3,
            py: 1,
            borderRadius: 1,
            backgroundColor: "primary.main",
            color: "white",
            fontWeight: "bold",
          }}
          component="span"
        >
          Go home
        </Typography>
      </Link>
    </Box>
  );
}
