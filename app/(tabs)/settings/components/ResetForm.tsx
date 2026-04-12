"use client";
import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { updateUserSettings } from "@/app/actions/user";
import { UserSettings } from "@/app/models/user";
import { appConstants } from "@/app/lib/constants";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  initialSettings: UserSettings;
}

const ResetForm: React.FC<Props> = ({ userId, initialSettings }) => {
  const router = useRouter();
  const handleSubmit = async () => {
    await updateUserSettings(userId, {
      ...initialSettings,
      issue_query: appConstants.defaultQuery,
      ticket_item_template: appConstants.defaultTicketTemplate,
      content_template: appConstants.defaultMailContent,
      mail_subject: appConstants.defaultSubject,
      mail_recipient: appConstants.defaultMailRecipient,
      assignee: appConstants.defaultAssignee,
    });
    router.refresh();
  };
  return (
    <Box component="form" action={handleSubmit} noValidate>
      <Button fullWidth variant="outlined" type="submit">
        <Typography>Reset settings to default</Typography>
      </Button>
    </Box>
  );
};

export default ResetForm;
