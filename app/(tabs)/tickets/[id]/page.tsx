import React from "react";
import {
  AppBar,
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getTicketDetails } from "@/app/actions/tickets";
import { colors } from "@/app/lib/theme";
import {
  PRIORITY_COLORS,
  DEFAULT_PRIORITY_COLOR,
  STATUS_COLORS_SOLID,
  DEFAULT_STATUS_COLOR_SOLID,
} from "@/app/lib/constants";
import TicketDescription from "./components/TicketDescription";
import TicketComments from "./components/TicketComments";

const getPriorityColor = (priority: string) =>
  PRIORITY_COLORS[priority] ?? DEFAULT_PRIORITY_COLOR;

const getStatusColor = (status: string) =>
  STATUS_COLORS_SOLID[status] ?? DEFAULT_STATUS_COLOR_SOLID;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const details = await getTicketDetails(id);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <AppBar
        position="static"
        sx={{
          borderRadius: 16,
          marginTop: 1,
          borderColor: "primary",
          borderWidth: 1,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            href="/tickets"
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
            {details?.key} Details
          </Typography>
        </Toolbar>
      </AppBar>

      {!details ? (
        <Box sx={{ p: 2 }}>
          <Typography>Failed to load ticket details.</Typography>
        </Box>
      ) : (
        <Stack sx={{ p: 2, gap: 1, flex: 1, overflowX: "clip" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {details.key}
          </Typography>
          <Typography>{details.summary}</Typography>

          <DetailRow label="Assignee">
            <Typography sx={{ fontWeight: "bold" }}>
              {details.assignee}
            </Typography>
          </DetailRow>

          <DetailRow label="Type">
            <Typography sx={{ fontWeight: "bold" }}>
              {details.type}
            </Typography>
          </DetailRow>

          <DetailRow label="Priority">
            <Typography
              sx={{
                fontWeight: "bold",
                color: getPriorityColor(details.priority),
              }}
            >
              {details.priority}
            </Typography>
          </DetailRow>

          <DetailRow label="Status">
            <Typography
              sx={{
                fontWeight: "bold",
                color: getStatusColor(details.status),
              }}
            >
              {details.status}
            </Typography>
          </DetailRow>

          {details.labels.length > 0 && (
            <Stack
              direction="row"
              sx={{ flexWrap: "wrap", alignItems: "center", gap: 1 }}
            >
              <Typography sx={{ color: colors.greySuit }}>
                Labels:
              </Typography>
              {details.labels.map((label) => (
                <Chip key={label} label={label} size="small" />
              ))}
            </Stack>
          )}

          <DetailRow label="Time spent">
            <Typography sx={{ fontWeight: "bold" }}>
              {details.timeSpent}
            </Typography>
          </DetailRow>

          {details.comments.length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <TicketComments comments={details.comments} />
            </>
          )}

          {details.description && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ color: colors.greySuit }}>
                Description
              </Typography>
              <TicketDescription text={details.description} />
            </>
          )}
        </Stack>
      )}
    </Box>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" sx={{ gap: 1 }}>
      <Typography sx={{ color: colors.greySuit }}>{label}:</Typography>
      {children}
    </Stack>
  );
}
