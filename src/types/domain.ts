// Тип одного товара, приходящего с API
export interface IProduct {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number;
}

// Тип заказа, отправляемого на сервер
export interface IOrderFormData {
  payment: string;
  address: string;
  email: string;
  phone: string;
}

// Тип корзины
export interface IBasketItem {
  id: string; // id продукта
  title: string;
  price: number;
}

// Статусы приложения (по шагам)
export type OrderStage = 'catalog' | 'preview' | 'basket' | 'order' | 'contacts' | 'success';
