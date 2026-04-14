"use client";

import React from "react";
import { TicketType, useTicketsStore } from "@/app/stores/tickets";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Chip,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt"; // Resolved — галочка
import AutorenewIcon from "@mui/icons-material/Autorenew"; // In Progress — процесс
import ReplayIcon from "@mui/icons-material/Replay"; // Reopened — снова открыто
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Closed — закрыто, выполнено
import MenuBookIcon from "@mui/icons-material/MenuBook"; // Story Review — чтение, ревью
import RateReviewIcon from "@mui/icons-material/RateReview"; // In Review — комментирование
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined"; // default — неизвестный статус
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { colors, withOpacity } from "@/app/lib/theme";
import {
  PRIORITY_COLORS,
  DEFAULT_PRIORITY_COLOR,
  STATUS_COLORS,
  DEFAULT_STATUS_COLOR,
} from "@/app/lib/constants";
import { Ticket } from "@/app/models/ticket";
import { useRouter } from "next/navigation";
import NextLink from "next/link";

interface Props {
  item: Ticket;
}

const TicketItem: React.FC<Props> = (props) => {
  const today = useTicketsStore((state) => state[TicketType.Today]);
  const tomorrow = useTicketsStore((state) => state[TicketType.Tomorrow]);
  const toggle = useTicketsStore((state) => state.toggle);

  const { item } = props;
  const getColor = (status: string) =>
    STATUS_COLORS[status] ?? DEFAULT_STATUS_COLOR;

  const getIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <TaskAltIcon />;
      case "To Do":
        return <AssignmentIcon />;
      case "In Progress":
        return <AutorenewIcon />;
      case "Reopened":
        return <ReplayIcon />;
      case "Closed":
        return <CheckCircleIcon />;
      case "Story Review":
        return <MenuBookIcon />;
      case "In Review":
        return <RateReviewIcon />;
      default:
        return <HelpOutlineIcon />;
    }
  };

  const getPriorityColor = (priority: string) =>
    PRIORITY_COLORS[priority] ?? DEFAULT_PRIORITY_COLOR;

  const isIncludedToday = today.some((it) => it.id === item.id);
  const isIncludedTomorrow = tomorrow.some((it) => it.id === item.id);
  const statusColor = getColor(item.status);
  const priorityColor = withOpacity(getPriorityColor(item.priority), 0.5);

  return (
    <>
      <Card
        sx={{
          borderRadius: 1,
          marginBottom: 1,
          padding: 1,
          borderLeft: `4px solid ${priorityColor}`,
          gap: 1,
          display: "flex",
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack sx={{ display: "flex", flex: 1, height: "100%" }}>
          <Stack
            sx={{
              paddingLeft: 1,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              marginBottom: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 0.5,
                width: "100%",
              }}
            >
              <Stack sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Stack>
                    <Typography
                      sx={{ fontWeight: "bold" }}
                      variant="body1"
                    >
                      {item.key}
                    </Typography>

                    <Stack sx={{ gap: 0.5 }} direction="row">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: getPriorityColor(item.priority),
                        }}
                      >
                        {item.priority}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: getPriorityColor(item.priority),
                        }}
                      >
                        {item.type}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack
                    sx={{ gap: 0.5, alignItems: "flex-end" }}
                    direction="column"
                  >
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        backgroundColor: statusColor,
                        fontWeight: "bold",
                      }}
                      icon={getIcon(item.status)}
                    />
                    <Stack
                      direction="row"
                      sx={{ gap: 0.5, alignItems: "center" }}
                    >
                      <AccountCircleIcon
                        sx={{ color: colors.greySuit, fontSize: 16 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold" }}
                      >
                        {item.assignee}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
                <Divider sx={{ marginTop: 0.5, marginBottom: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.summary}
                  <br />
                  <Link href={`/tickets/${item.id}`} component={NextLink}>
                    Show More...
                  </Link>
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" sx={{ gap: 1, marginTop: 1 }}>
            <ButtonGroup
              fullWidth
              orientation="horizontal"
              aria-label="Vertical button group"
            >
              <Button
                sx={{ display: "flex", flex: 1 }}
                variant={isIncludedToday ? "contained" : "outlined"}
                onClick={() => toggle(item, TicketType.Today)}
                key="one"
                size={"small"}
              >
                Today
              </Button>
              <Button
                sx={{ display: "flex", flex: 1 }}
                variant={isIncludedTomorrow ? "contained" : "outlined"}
                onClick={() => toggle(item, TicketType.Tomorrow)}
                key="two"
                size={"small"}
              >
                Tomorrow
              </Button>
            </ButtonGroup>
          </Stack>
        </Stack>
      </Card>
    </>
  );
};

export default TicketItem;
