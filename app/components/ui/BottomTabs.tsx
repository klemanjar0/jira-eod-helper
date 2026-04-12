"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AppsIcon from "@mui/icons-material/Apps";
import PortraitIcon from "@mui/icons-material/Portrait";
import EmailIcon from "@mui/icons-material/Email";
import { BOTTOM_NAVBAR_HEIGHT } from "@/app/lib/theme";

const tabs = [
  { value: "/tickets", label: "Tickets", icon: <AppsIcon /> },
  { value: "/account", label: "Account", icon: <PortraitIcon /> },
  { value: "/email", label: "Email", icon: <EmailIcon /> },
  { value: "/settings", label: "Settings", icon: <SettingsIcon /> },
] as const;

const BottomTabs: React.FC = () => {
  const pathname = usePathname();

  const activeTab =
    tabs.find((t) => pathname.startsWith(t.value))?.value ?? false;

  return (
    <BottomNavigation
      sx={{
        width: "100vw",
        height: BOTTOM_NAVBAR_HEIGHT,
        position: "fixed",
        zIndex: 1000,
        left: 0,
        bottom: 0,
        backgroundColor: "#262626DD",
      }}
      showLabels
      value={activeTab}
    >
      {tabs.map((tab) => (
        <BottomNavigationAction
          key={tab.value}
          value={tab.value}
          label={tab.label}
          icon={tab.icon}
          component={Link}
          href={tab.value}
        />
      ))}
    </BottomNavigation>
  );
};

export default BottomTabs;
