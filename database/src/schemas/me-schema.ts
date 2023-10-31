export const meSchema = {
  title: "me",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 16,
    },
    productsInCart: {
      type: "array",
      ref: "products",
      items: {
        type: "string",
      },
    },
  },
  required: ["id", "productsInCart"],
} as const;
