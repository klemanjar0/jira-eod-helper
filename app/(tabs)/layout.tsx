import React from "react";
import Box from "@mui/material/Box";
import BottomTabs from "@/app/components/ui/BottomTabs";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Box component="main" sx={{ flex: 1, pb: "64px" }}>
        {children}
      </Box>
      <BottomTabs />
    </Box>
  );
}
