import type { Session, User } from "lucia";
import { db } from "./db";
import type { SocketAddress } from "bun";

export type ContextVariables = {
  db: typeof db;
  user: User | null;
  session: Session | null;
};

export type Bindings = {
  ip: SocketAddress;
};
