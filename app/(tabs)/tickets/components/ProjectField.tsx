"use client";

import React, { useTransition } from "react";
import {
  CircularProgress,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useDebouncedCallback } from "use-debounce";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ui/ToastProvider";
import { updateUserSettings } from "@/app/actions/user";

type Props = {
  userId: string;
  projectId: string;
};

const ProjectField: React.FC<Props> = ({ userId, projectId }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handelSetProjectId = useDebouncedCallback(
    async (value: string) => {
      const result = await updateUserSettings(userId, {
        project_id: value,
      });

      if (!result) {
        showToast("Failed to set Project ID. Please try again.", "error");
      } else {
        startTransition(() => router.refresh());
      }
    },
    1000,
  );

  return (
    <TextField
      name="project-id-field"
      label="Project ID"
      type="text"
      size="small"
      defaultValue={projectId}
      onChange={(e) => handelSetProjectId(e.target.value)}
      slotProps={{
        input: {
          endAdornment: isPending ? (
            <InputAdornment position="end">
              <CircularProgress size={16} />
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
};

export default ProjectField;
