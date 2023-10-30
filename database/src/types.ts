import { RxDatabase, RxCollection, RxDocument } from "rxdb";

export type ProductDocType = {
  id: string;
  title: string;
  image: string;
  description: string;
  price: number;
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
