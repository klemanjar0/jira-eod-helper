import React from "react";
import { getTickets } from "@/app/actions/tickets";
import TicketItem from "@/app/(tabs)/tickets/components/TicketItem";
import { Ticket } from "@/app/models/ticket";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SearchBar } from "@/app/(tabs)/tickets/components/SearchBar";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : undefined;
  const res = await getTickets(query);
  const tickets: Ticket[] = res.tickets;

  const renderTicket = (item: Ticket) => (
    <TicketItem item={item} key={item.id} />
  );

  return (
    <Box
      sx={{
        marginTop: 1,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <SearchBar />

      {tickets.length === 0 ? (
        <Box
          sx={{ display: "flex", justifyContent: "center", padding: 2 }}
        >
          <Typography>No Tickets available</Typography>
        </Box>
      ) : null}

      {/*{!tickets.isLoading && !!tickets.error ? (*/}
      {/*  <Box*/}
      {/*    sx={{ display: "flex", justifyContent: "center", padding: 2 }}*/}
      {/*  >*/}
      {/*    <Typography>{tickets.error}</Typography>*/}
      {/*  </Box>*/}
      {/*) : null}*/}

      {tickets.map(renderTicket)}
    </Box>
  );
}
