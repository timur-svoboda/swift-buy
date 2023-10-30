import { RxDatabase, RxCollection, RxJsonSchema, RxDocument } from "rxdb";

export type ProductDocType = {
  id: string;
  title: string;
};

export type ProductDocMethods = {};

export type ProductDocument = RxDocument<ProductDocType, ProductDocMethods>;

export type ProductCollectionMethods = {};

export type ProductCollection = RxCollection<
  ProductDocType,
  ProductDocMethods,
  ProductCollectionMethods
>;

export type Collections = {
  products: ProductCollection;
};

export type Database = RxDatabase<Collections>;
