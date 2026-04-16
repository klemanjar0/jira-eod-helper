"use client";

import React, { useCallback, useState, useTransition } from "react";
import { UserSettings } from "@/app/models/user";
import { Box, Divider, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { colors, MAX_WIDTH } from "@/app/lib/theme";
import EmailIcon from "@mui/icons-material/Email";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import { buildEmailURI } from "@/app/lib/utils";
import { TicketType, useTicketsStore } from "@/app/stores/tickets";
import { useRouter } from "next/navigation";
import { updateUserSettings } from "@/app/actions/user";
import { useToast } from "@/app/components/ui/ToastProvider";

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
  const [recipient, setRecipient] = useState(settings.mail_recipient ?? "");
  const [subject, setSubject] = useState(settings.mail_subject ?? "");
  const [editingField, setEditingField] = useState<"recipient" | "subject" | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const nameChanged = name !== (settings.username ?? "");

  const handleSubmitName = () => {
    startTransition(async () => {
      const result = await updateUserSettings(userId, {
        username: name,
      });

      if (!result) {
        showToast(
          "Failed to save author name. Please try again.",
          "error",
        );
      } else {
        showToast("Author name saved.", "success");
        router.refresh();
      }
    });
  };

  const handleSaveField = (field: "recipient" | "subject") => {
    const update =
      field === "recipient"
        ? { mail_recipient: recipient }
        : { mail_subject: subject };

    startTransition(async () => {
      const result = await updateUserSettings(userId, update);

      if (!result) {
        showToast("Failed to save. Please try again.", "error");
      } else {
        showToast("Saved.", "success");
        setEditingField(null);
        router.refresh();
      }
    });
  };

  const handleCancelField = (field: "recipient" | "subject") => {
    if (field === "recipient") setRecipient(settings.mail_recipient ?? "");
    else setSubject(settings.mail_subject ?? "");
    setEditingField(null);
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
      template: { ...settings, mail_recipient: recipient, mail_subject: subject },
    });
  }, [date, tomorrowTickets, todayTickets, settings, recipient, subject]);

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

  const renderInlineField = (
    field: "recipient" | "subject",
    label: string,
    value: string,
    setValue: (v: string) => void,
    placeholder: string,
  ) => {
    const isEditing = editingField === field;

    if (isEditing) {
      return (
        <Stack direction="row" sx={{ gap: 1, mb: 1, alignItems: "center" }}>
          <Typography color={colors.greySuit} sx={{ minWidth: 56 }}>{label}</Typography>
          <TextField
            value={value}
            onChange={(e) => setValue(e.target.value)}
            variant="outlined"
            size="small"
            placeholder={placeholder}
            fullWidth
            disabled={isPending}
            autoFocus
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleSaveField(field)}
                      disabled={isPending}
                      color="primary"
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleCancelField(field)}
                      disabled={isPending}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      );
    }

    return (
      <Stack direction="row" sx={{ gap: 1, mb: 1, alignItems: "center" }}>
        <Typography color={colors.greySuit} sx={{ minWidth: 56 }}>{label}</Typography>
        <Typography sx={{ fontWeight: "bold", flex: 1 }}>{value}</Typography>
        <IconButton
          size="small"
          onClick={() => setEditingField(field)}
          disabled={isPending || editingField !== null}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Stack>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        padding: 1,
        paddingTop: 2,
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

        {renderInlineField("recipient", "To:", recipient, setRecipient, "recipient@example.com")}
        {renderInlineField("subject", "Subject:", subject, setSubject, "Email subject")}

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
