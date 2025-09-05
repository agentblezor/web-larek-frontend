// src/types/views.ts
import { IProduct } from './domain';
import { IBasketItem } from './models';

/**
 * Каталог
 */
export interface ICatalogView {
  renderCatalog(products: IProduct[]): void;
  bindCardClick(handler: (id: string) => void): void;
  createCardPreview(product: IProduct): HTMLElement;
}

/**
 * Корзина
 */
export interface IBasketView {
  mount(root: HTMLElement): void;
  renderBasket(items: IBasketItem[], total: number): void;
  bindDeleteClick(handler: (id: string) => void): void;
  bindCheckoutClick(handler: () => void): void;
}

/**
 * Модалка
 */
export interface IModalView {
  readonly content: HTMLElement;
  open(content: HTMLElement): void;
  close(): void;
}

/**
 * Оформление заказа (этап 1 и 2)
 */
export interface IOrderView {
  renderStage1(): void;
  renderStage2(): void;

  setErrors(message: string): void;

  // управление доступностью кнопок
  setNextEnabled?(enabled: boolean): void;
  setPayEnabled?(enabled: boolean): void;

  // колбэки шага 1
  onPaymentSelect?(cb: (method: 'card' | 'cash') => void): void;
  onAddressInput?(cb: (value: string) => void): void;
  onAddressBlur?(cb: () => void): void;
  onNextFromStage1?(cb: () => void): void;

  // колбэки шага 2
  onContactsInput?(cb: (v: { email: string; phone: string }) => void): void;
  onPay?(cb: () => void): void;
}

