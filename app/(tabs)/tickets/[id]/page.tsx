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
import TicketDescription from "./components/TicketDescription";
import TicketComments from "./components/TicketComments";

function getPriorityColor(priority: string) {
  switch (priority) {
    case "Blocker":
      return "#FF4C4C";
    case "Critical":
      return "#FF7043";
    case "Major":
      return "#FFA500";
    case "Minor":
      return "#1E90FF";
    case "Trivial":
      return "#AAAAAA";
    default:
      return "#777777";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Resolved":
      return "#32CD32";
    case "To Do":
      return "#CCCCCC";
    case "In Progress":
      return "#1E90FF";
    case "Reopened":
      return "#FF6347";
    case "Closed":
      return "#228B22";
    case "Story Review":
      return "#9370DB";
    case "In Review":
      return "#87CEFA";
    default:
      return "#888888";
  }
}

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
