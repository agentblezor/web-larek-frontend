import { IProduct, IBasketItem, IOrderFormData } from './domain';


export interface ICatalogModel {
  setProducts(products: IProduct[]): void;
  getProducts(): IProduct[];
  getProductById(id: string): IProduct | undefined;
}

// остальное без изменений…
export interface IBasketModel {
  getItems(): IBasketItem[];
  addItem(item: IBasketItem): void;
  removeItem(id: string): void;
  clear(): void;
  getTotal(): number;
  hasItem(id: string): boolean;
}

export interface IOrderModel {
  setPaymentMethod(method: string): void;
  setAddress(address: string): void;
  setContacts(data: Pick<IOrderFormData, 'email' | 'phone'>): void;
  getOrderData(): IOrderFormData;
  isValidStage1(): boolean;
  isValidStage2(): boolean;
}
