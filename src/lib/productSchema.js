import { z } from "zod";

export const productSchema = z
  .object({
    name: z.string().min(1, "name wajib diisi"),
    tag: z.string().min(1, "tag wajib diisi"),
    imgSrc: z.string().optional().default(""),
    imgAlt: z.string().optional().default(""),
  })
  .transform((product) => ({
    ...product,
    tag: product.tag.toLowerCase(),
    imgAlt: product.imgAlt?.trim() || product.name,
  }));

export function normalizeProduct(input) {
  return productSchema.parse(input);
}
