import { productDetailContent } from "./data";

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  brand: string;
  imageAlt: string;
  imageUrl: string;
  price: string;
  quantity: number;
  size: string;
}

const [brand] = productDetailContent.collectionLabel.split(" / ");
const [featuredImage] = productDetailContent.gallery;

export const cartSeedItems: CartItem[] = [
  {
    id: "cart-item-01",
    productId: productDetailContent.slug,
    title: productDetailContent.title,
    brand: brand ?? "Comme des Garcons",
    imageAlt: featuredImage.alt,
    imageUrl: featuredImage.imageUrl,
    price: productDetailContent.price,
    quantity: 1,
    size: "M",
  },
];
