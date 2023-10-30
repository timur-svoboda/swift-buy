import { RxJsonSchema } from "rxdb";
import { ProductDocType } from "../types";

export const productSchema: RxJsonSchema<ProductDocType> = {
  title: "Product",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 16,
    },
    title: {
      type: "string",
    },
  },
  required: ["id", "title"],
};
