"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  CircularProgress,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useTransition } from "react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, 300);

  return (
    <TextField
      name="search-field-issues"
      label="Search Issues"
      type="search"
      fullWidth
      size="small"
      sx={{ my: 2 }}
      defaultValue={searchParams.get("q") ?? ""}
      onChange={(e) => handleSearch(e.target.value)}
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
}
