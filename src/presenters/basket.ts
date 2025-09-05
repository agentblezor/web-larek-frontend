// src/presenters/basket.ts
import { IEvents } from '../components/base/events';
import { AppEvent } from '../types/events';
import { IBasketItem } from '../types/models';
import { BasketModel } from '../models/basket';
import { BasketView } from '../views/basket';
import { CatalogModel } from '../models/catalog';

export class BasketPresenter {
  constructor(
    private model: BasketModel,
    private view: BasketView,
    private events: IEvents,
    private catalog: CatalogModel
  ) {}

  init() {
    // ВАЖНО: не трогаем view.bind* здесь — view монтируется только при открытии модалки

    // Добавление товара
    this.events.on<{ id: string }>(AppEvent.ProductAddedToBasket, ({ id }) => {
      const p = this.catalog.getProductById(id);
      if (!p) return;
      const item: IBasketItem = { id: p.id, title: p.title, price: (p as any).price ?? 0 };
      if (!this.model.hasItem || !this.model.hasItem(id)) {
        this.model.addItem(item);
      }
      this.updateViewSafe();
    });

    // Удаление товара
    this.events.on<{ id: string }>(AppEvent.ProductRemovedFromBasket, ({ id }) => {
      if (this.model.removeItem) this.model.removeItem(id);
      this.updateViewSafe();
    });

    // Оформление заказа завершено — очистить корзину
    this.events.on(AppEvent.OrderCompleted, () => {
      if (this.model.clear) this.model.clear();
      this.updateViewSafe();
    });
  }

  private updateView() {
    this.view.renderBasket(this.model.getItems(), this.model.getTotal());
  }

  private updateViewSafe() {
    try {
      this.updateView();
    } catch {
      // Корзина не смонтирована (модалка закрыта) — игнорируем
    }
  }
}
