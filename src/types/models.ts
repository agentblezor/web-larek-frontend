import { IProduct, IOrderFormData } from './domain';

// Интерфейс модели каталога
export interface ICatalogModel {
  getProducts(): Promise<IProduct[]>;
  getProductById(id: string): IProduct | undefined;
}

// Интерфейс модели корзины
export interface IBasketModel {
  getItems(): IBasketItem[];
  addItem(item: IBasketItem): void;
  removeItem(id: string): void;
  clear(): void;
  getTotal(): number;
  hasItem(id: string): boolean;
}

// Интерфейс модели оформления заказа
export interface IOrderModel {
  setPaymentMethod(method: string): void;
  setAddress(address: string): void;
  setContacts(data: Pick<IOrderFormData, 'email' | 'phone'>): void;
  getOrderData(): IOrderFormData;
  isValidStage1(): boolean;
  isValidStage2(): boolean;
}

export interface IBasketItem {
  id: string;
  title: string;
  price: number | null | undefined;
}