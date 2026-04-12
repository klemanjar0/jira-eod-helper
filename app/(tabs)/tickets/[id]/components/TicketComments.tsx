import React from "react";
import { Stack, Typography } from "@mui/material";
import { TicketComment } from "@/app/models/ticket";
import { colors } from "@/app/lib/theme";

interface Props {
  comments: TicketComment[];
}

const TicketComments: React.FC<Props> = ({ comments }) => {
  return (
    <Stack sx={{ gap: 2 }}>
      <Typography sx={{ color: colors.greySuit }}>
        Comments ({comments.length})
      </Typography>
      {comments.map((comment) => (
        <Stack key={comment.id} sx={{ gap: 0.5 }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: "baseline" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {comment.author}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.greySuit }}>
              {formatDate(comment.created)}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {comment.body}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default TicketComments;
