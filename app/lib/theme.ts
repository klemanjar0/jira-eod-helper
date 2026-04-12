"use client";

import { createTheme } from "@mui/material/styles";

export const BOTTOM_NAVBAR_HEIGHT = "4rem";

export const MAX_WIDTH = "768px";

export function withOpacity(hex: string, opacity: number): string {
  hex = hex.trim().toLowerCase();

  if (!/^#([0-9a-f]{6}|[0-9a-f]{8})$/.test(hex)) {
    throw new Error(`invalid hex color: ${hex}`);
  }

  const clamped = Math.max(0, Math.min(1, opacity));

  const alpha = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0");

  if (hex.length === 9) {
    return hex.slice(0, 7) + alpha;
  }

  return hex + alpha;
}

export const colors = {
  lochmara: "#1F6AAC",
  sunsetOrange: "#FF4A4A",
  violentViolet: "#100040",
  darkLochmara: "#053C80",
  dolphin: "#74747B",
  mischka: "#A4AAB3",
  ghost: "#C8C7CC",
  spindle: "#B3C2D8",
  blueChalk: "#E3DBEE",
  serenade: "#FAE4D0",
  oysterBay: "#D5ECEB",
  blueRomance: "#D3E7D2",
  surfCrest: "#BEDBBB",
  sandyBeach: "#FAD5B4",
  mabel: "#C6E8E6",
  fog: "#D5C8E5",
  kellyGreen: "#5BD700",
  pigmentGreen: "#00B146",
  pattensBlue: "#D2E5F6",
  darkOrange: "#FF9500",
  superNova: "#FFBD42",
  mediumOrchid: "#D141EF",
  freeSpeechMagenta: "#FF5CE1",
  turquoise: "#50E3C2",
  gorse: "#FFE227",
  gainsboro: "#DEDEDE",
  white: "#FFFFFF",
  snow: "#F9F9F9",
  lavender: "#EFEFF4",
  greySuit: "#8E8E93",
  dolphinIOS: "#767680",
  black: "#000000",
  tertiary: "rgba(118, 118, 128, 0.12)",
  danube: "#5391C6",
  aliceBlue: "#EDF5FB",
  transparent: "transparent",
  toast: "#424242",
  indigo: "#5856D6",
  polygonColorOK: "#007AFF",
  cloudBurst: "#393E46",
  sail: "#A2C4E2",
  backgroundLight: "#F2F2F7",
  backgroundDark: "#3C3C4399",
  persianRed: "#D23C2D",
  paleBlue: "#E8ECF1",
};

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
