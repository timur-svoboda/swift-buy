import { useCallback, useEffect, useState } from "react";
import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { DatabaseContext } from "./database-context";
import { Collections, Database } from "./types";
import { productSchema } from "./schemas/product-schema";

export interface DatabaseProviderProps {
  children?: React.ReactNode;
}

export const DatabaseProvider = (props: DatabaseProviderProps) => {
  const { children } = props;

  const [database, setDatabase] = useState<Database>();

  const initDatabase = useCallback(async () => {
    const database = await createRxDatabase<Collections>({
      name: "database",
      storage: getRxStorageDexie(),
      multiInstance: true,
    });

    await database.addCollections({
      products: {
        schema: productSchema,
      },
    });

    setDatabase(database);
  }, [setDatabase]);

  useEffect(() => {
    initDatabase();
  }, [initDatabase]);

  return (
    <DatabaseContext.Provider value={{ database }}>
      {children}
    </DatabaseContext.Provider>
  );
};
