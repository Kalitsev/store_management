import { ProductInStoreModel } from "./product-in-store.model";

export interface StoreCardModel {
  name: string;
  total: number;
  leastPopularProduct: ProductInStoreModel;
  products: ProductInStoreModel[];
}
