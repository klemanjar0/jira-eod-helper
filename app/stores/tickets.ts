import { create } from "zustand";
import { Ticket } from "@/app/models/ticket";

export enum TicketType {
  Today = "today",
  Tomorrow = "tomorrow",
}

type TicketsStore = {
  [TicketType.Today]: Ticket[];
  [TicketType.Tomorrow]: Ticket[];
  toggle: (ticket: Ticket, type: TicketType) => void;
  reset: () => void;
};

export const useTicketsStore = create<TicketsStore>((set) => ({
  [TicketType.Today]: [] as Ticket[],
  [TicketType.Tomorrow]: [] as Ticket[],
  toggle: (ticket: Ticket, type: TicketType) =>
    set((state) => ({
      [type]: state[type].find((it) => it.id === ticket.id)
        ? state[type].filter((it) => it.id !== ticket.id)
        : state[type].concat(ticket),
    })),
  reset: () =>
    set(() => ({
      [TicketType.Today]: [],
      [TicketType.Tomorrow]: [],
    })),
}));
