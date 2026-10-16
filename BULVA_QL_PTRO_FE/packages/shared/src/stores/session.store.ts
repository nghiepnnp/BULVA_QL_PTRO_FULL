import { create } from "zustand";
import type { User } from "../schemas/auth.schema";

type SessionStatus = "loading" | "guest" | "authenticated";

type SessionState = {
  user: User | null;
  status: SessionStatus;
  setUser: (user: User) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  user: null,

  // Không chặn giao diện trong khi khôi phục phiên.
  status: "guest",

  setUser: (user) =>
    set({
      user,
      status: "authenticated",
    }),

  clear: () =>
    set({
      user: null,
      status: "guest",
    }),
}));