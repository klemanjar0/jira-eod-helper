"use client";
import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { updateUserSettings } from "@/app/actions/user";
import { UserSettings } from "@/app/models/user";
import { appConstants } from "@/app/lib/constants";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ui/ToastProvider";

interface Props {
  userId: string;
}

const ResetForm: React.FC<Props> = ({ userId }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const handleSubmit = async () => {
    const result = await updateUserSettings(userId, {
      issue_query: appConstants.defaultQuery,
      ticket_item_template: appConstants.defaultTicketTemplate,
      content_template: appConstants.defaultMailContent,
      mail_subject: appConstants.defaultSubject,
      mail_recipient: appConstants.defaultMailRecipient,
      assignee: appConstants.defaultAssignee,
      is_using_master_key: true,
      assignee_is_current_user: true,
      username: appConstants.defaultUsername,
    });

    if (!result) {
      showToast("Failed to reset settings. Please try again.", "error");
    } else {
      showToast("Settings reset to defaults.", "success");
      router.refresh();
    }
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
