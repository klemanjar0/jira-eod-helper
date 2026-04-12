"use client";

import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Stack } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const JQLSearchField: React.FC<Props> = ({ value, onChange }) => {
  const [params, setParams] = React.useState(value.split(","));

  const onChangeValue = (idx: number, newValue: string) => {
    const newParams = params.map((it, index) =>
      idx === index ? newValue : it,
    );

    setParams(newParams);
    onSave(newParams);
  };

  const onAddRow = () => {
    setParams((prev) => [...prev, ""]);
  };

  const onRemove = (idx: number) => () => {
    const newParams = [...params];
    newParams.splice(idx, 1);
    setParams(newParams);
    onSave(newParams);
  };

  const onSave = (newParams: string[]) => {
    const result = newParams.filter(Boolean).join(",");
    onChange(result);
  };

  return (
    <Box>
      {params.map((item, idx) => (
        <Box
          key={idx}
          sx={{
            pb: 1,
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <TextField
            value={item}
            onChange={(e) => onChangeValue(idx, e.target.value)}
            size="small"
            fullWidth
          />
          <Button
            sx={{ height: "100%" }}
            onClick={onRemove(idx)}
            variant="text"
          >
            <DeleteForeverIcon color="error" fontSize="small" />
          </Button>
        </Box>
      ))}
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          sx={{ mt: 1 }}
          onClick={onAddRow}
          fullWidth
        >
          Add Row
        </Button>
      </Stack>
    </Box>
  );
};

export default JQLSearchField;
