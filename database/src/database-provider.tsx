import { useEffect, useState } from "react";
import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { DatabaseContext } from "./database-context";
import { productSchema } from "./schemas/product-schema";
import { Collections, Database } from "./types";
import { generateId } from "./utils/generate-id";
import { demoProducts } from "./demo-data";

export interface DatabaseProviderProps {
  children?: React.ReactNode;
}

export const DatabaseProvider = (props: DatabaseProviderProps) => {
  const { children } = props;

  const [database, setDatabase] = useState<Database>();

  useEffect(() => {
    const initDatabase = async () => {
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

      const productNumber = await database.collections.products.count().exec();
      if (productNumber === 0) {
        for (const demoProduct of demoProducts) {
          await database.collections.products.insert(demoProduct);
        }
      }

      setDatabase(database);
    };

    initDatabase();
  }, [setDatabase]);

  return (
    <DatabaseContext.Provider value={{ database }}>
      {children}
    </DatabaseContext.Provider>
  );
};
