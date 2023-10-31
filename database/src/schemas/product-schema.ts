
export const productSchema = {
  title: "product",
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
  required: ["id", "image", "title", "description", "price"],
} as const;
