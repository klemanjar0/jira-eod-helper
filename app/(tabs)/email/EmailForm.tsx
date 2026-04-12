"use client";

import React, { useCallback, useState, useTransition } from "react";
import { UserSettings } from "@/app/models/user";
import { Box, Divider, Stack, TextField, Typography } from "@mui/material";
import { colors, MAX_WIDTH } from "@/app/lib/theme";
import EmailIcon from "@mui/icons-material/Email";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import Button from "@mui/material/Button";
import { buildEmailURI } from "@/app/lib/utils";
import { TicketType, useTicketsStore } from "@/app/stores/tickets";
import { useRouter } from "next/navigation";
import { updateUserSettings } from "@/app/actions/user";

interface Props {
  userId: string;
  settings: UserSettings;
  initialDate: string;
}

const EmailForm: React.FC<Props> = ({ settings, initialDate, userId }) => {
  const todayTickets = useTicketsStore((state) => state[TicketType.Today]);
  const tomorrowTickets = useTicketsStore(
    (state) => state[TicketType.Tomorrow],
  );
  const [date, setDate] = React.useState(initialDate);
  const [name, setName] = useState(settings.username ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const nameChanged = name !== (settings.username ?? "");

  const handleSubmitName = () => {
    startTransition(async () => {
      await updateUserSettings(userId, {
        ...settings,
        username: name,
      });
      router.refresh();
    });
  };

  const onDateChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = new Date(e.target.value);
    const dd = String(value.getDate()).padStart(2, "0");
    const mm = String(value.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = value.getFullYear();
    setDate(`${yyyy}-${mm}-${dd}`);
  };

  const getEmail = useCallback(() => {
    return buildEmailURI({
      today: todayTickets,
      tomorrow: tomorrowTickets,
      date: date,
      template: settings,
    });
  }, [date, tomorrowTickets, todayTickets, settings]);

  const href = getEmail().encoded;

  const renderEmail = () => {
    return getEmail()
      .result.body.split(/(\n\n)/)
      .map((chunk, idx) => {
        if (chunk === "\n\n") {
          return <Typography key={`para-${idx}`}>&nbsp;</Typography>;
        }
        return chunk
          .split("\n")
          .map((line, subIdx) => (
            <Typography key={`line-${idx}-${subIdx}`}>{line}</Typography>
          ));
      });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        padding: 1,
        maxWidth: MAX_WIDTH,
        margin: "auto",
      }}
    >
      <Stack direction="row" sx={{ gap: 1, mb: 1 }}>
        <PersonIcon color="primary" />
        <Typography color="primary" sx={{ fontWeight: "bold" }}>
          Author Name
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          size="small"
          placeholder="Your name"
          fullWidth
          disabled={isPending}
        />
        <Button
          variant="contained"
          onClick={handleSubmitName}
          disabled={isPending || !nameChanged}
        >
          {isPending ? "..." : "Save"}
        </Button>
      </Stack>

      <Stack
        direction="row"
        sx={{
          gap: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" sx={{ gap: 1, mb: 1 }}>
          <CalendarMonthIcon color="primary" />
          <Typography color="primary" sx={{ fontWeight: "bold" }}>
            Email Date
          </Typography>
        </Stack>
        <TextField
          onChange={onDateChanged}
          value={date}
          variant="outlined"
          type="date"
          size="small"
        />
      </Stack>

      <Stack sx={{ my: 2 }}>
        <Stack direction="row" sx={{ gap: 1, mb: 1 }}>
          <EmailIcon color="primary" />
          <Typography color="primary" sx={{ fontWeight: "bold" }}>
            Email Preview
          </Typography>
        </Stack>

        <Stack direction="row" sx={{ gap: 1, mb: 1 }}>
          <Typography color={colors.greySuit}>To:</Typography>
          <Typography sx={{ fontWeight: "bold" }}>
            {settings.mail_recipient}
          </Typography>
        </Stack>

        <Stack direction="row" sx={{ gap: 1, mb: 1 }}>
          <Typography color={colors.greySuit}>Subject:</Typography>
          <Typography sx={{ fontWeight: "bold" }}>
            {settings.mail_subject}
          </Typography>
        </Stack>

        <Divider textAlign="left" sx={{ my: 2 }}>
          <Typography>Email Body</Typography>
        </Divider>
        {renderEmail()}
        <Divider sx={{ my: 2 }} />
      </Stack>

      <Button variant="contained" color="success" href={href}>
        Open in mail app
      </Button>
    </Box>
  );
};

export default EmailForm;
