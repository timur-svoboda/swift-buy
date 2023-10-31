import { useEffect, useState } from "react";
import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { DatabaseContext } from "./database-context";
import { productSchema } from "./schemas/product-schema";
import { Collections, Database } from "./types";
import { generateId } from "./utils/generate-id";
import { demoProducts } from "./demo-data";
import { meSchema } from "./schemas/me-schema";

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
        me: {
          schema: meSchema,
        },
      });

      const productNumber = await database.collections.products.count().exec();
      if (productNumber === 0) {
        for (const demoProduct of demoProducts) {
          await database.collections.products.insert(demoProduct);
        }
      }

      const meNumber = await database.collections.me.count().exec();
      if (meNumber === 0) {
        await database.collections.me.insert({
          id: generateId(),
          productsInCart: [],
        });
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
