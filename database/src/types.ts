import {
  RxDatabase,
  RxCollection,
  RxDocument,
  ExtractDocumentTypeFromTypedRxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";
import { productSchema } from "./schemas/product-schema";
import { meSchema } from "./schemas/me-schema";

const typedProductSchema = toTypedRxJsonSchema(productSchema);

export type ProductDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof typedProductSchema
>;

export type ProductDocMethods = {};

export type ProductDocument = RxDocument<ProductDocType, ProductDocMethods>;

export type ProductCollectionMethods = {};

export type ProductCollection = RxCollection<
  ProductDocType,
  ProductDocMethods,
  ProductCollectionMethods
>;

const typedMeSchema = toTypedRxJsonSchema(meSchema);

export type MeDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof typedMeSchema
>;

export type MeDocMethods = {};

export type MeDocument = RxDocument<ProductDocType, ProductDocMethods>;

export type MeCollectionMethods = {};

export type MeCollection = RxCollection<
  MeDocType,
  MeDocMethods,
  MeCollectionMethods
>;

export type Collections = {
  products: ProductCollection;
  me: MeCollection;
};

export type Database = RxDatabase<Collections>;
