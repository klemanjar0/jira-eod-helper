import React from "react";
import Typography from "@mui/material/Typography";

interface Props {
  text: string;
}

const TicketDescription: React.FC<Props> = ({ text }) => {
  const lines = text.split(/\n\n|\n/);

  return (
    <>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <Typography key={`empty-${idx}`}>&nbsp;</Typography>;
        }

        const replaced = trimmed.replace(/^#\s*/, "– ");
        const parts = replaced.split(/(\*.*?\*)/g);

        return (
          <Typography key={`line-${idx}`}>
            {parts.map((part, i) => {
              const match = part.match(/^\*(.*?)\*$/);
              if (match) {
                return <strong key={`bold-${idx}-${i}`}>{match[1]}</strong>;
              }
              return part;
            })}
          </Typography>
        );
      })}
    </>
  );
};

export default TicketDescription;
