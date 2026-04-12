import React from "react";
import { getTickets } from "@/app/actions/tickets";
import TicketItem from "@/app/(tabs)/tickets/components/TicketItem";
import { Ticket } from "@/app/models/ticket";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default async function TicketsPage() {
  const res = await getTickets();
  const tickets: Ticket[] = res.tickets;

  const renderHeader = () => {
    return <></>;
  };

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
      {renderHeader()}

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
