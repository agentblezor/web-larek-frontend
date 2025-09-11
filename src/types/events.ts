// Список событий, которые может приложение
export const enum AppEvent {
  CatalogProductSelected = 'catalog:product-selected',
  ProductAddedToBasket = 'basket:product-added',
  ProductRemovedFromBasket = 'basket:product-removed',
  CheckoutStarted = 'basket:checkout',
  OrderStage1Submitted = 'order:stage1-submitted',
  OrderStage2Submitted = 'order:stage2-submitted',
  OrderCompleted = 'order:completed',
  ModalClosed = 'modal:closed',
  ScreenChanged = 'screenChanged'
}

// Примеры полезных интерфейсов данных для событий
export interface ProductSelectedEvent {
  id: string;
}

export interface BasketUpdateEvent {
  id: string;
}

export interface OrderStage1Event {
  payment: string;
  address: string;
}

export interface OrderStage2Event {
  email: string;
  phone: string;
}
