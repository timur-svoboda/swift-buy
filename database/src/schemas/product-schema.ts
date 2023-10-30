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
    image: {
      type: "string",
    },
    title: {
      type: "string",
    },
    description: {
      type: "string",
    },
    price: {
      type: "number",
    },
  },
  required: ["id", "title", "description", "price"],
};
