import { createContext } from "react";
import { Database } from "./types";

export interface DatabaseContextValue {
  database?: Database;
}

export const DatabaseContext = createContext<DatabaseContextValue>({});
