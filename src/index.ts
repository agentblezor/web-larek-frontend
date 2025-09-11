// src/index.ts
import './scss/styles.scss';

import { CatalogModel } from './models/catalog';
import { BasketModel } from './models/basket';
import { OrderModel } from './models/order';
import { UiStateModel } from './models/ui';

import { CatalogView } from './views/catalog';
import { BasketView } from './views/basket';
import { OrderView, SuccessMessage } from './views/order';
import { ModalView } from './views/modal';

import { CatalogPresenter } from './presenters/catalog';
import { BasketPresenter } from './presenters/basket';
import { OrderPresenter } from './presenters/order';

import { EventEmitter } from './components/base/events';
import { Api } from './components/base/api';
import { API_URL } from './utils/constants';
import { ensureElement, cloneTemplate } from './utils/utils';
import { AppEvent } from './types/events';
import { IUiState } from './types/ui';

function boot() {
  // 1) выключаем демонстрационные модалки из вёрстки
  document.querySelectorAll('.modal.modal_active').forEach((m) => m.classList.remove('modal_active'));
  document.querySelectorAll<HTMLElement>('.modal').forEach((m) => {
    if (m.id !== 'modal-container') m.style.display = 'none';
  });

  // 2) ядро
  const events = new EventEmitter();
  const api = new Api(API_URL);

  // 3) модели
  const catalogModel = new CatalogModel();
  const basketModel = new BasketModel();
  const orderModel = new OrderModel();
  const ui = new UiStateModel(events);

  // 4) представления
  const modal = new ModalView('#modal-container');
  const catalogView = new CatalogView('.gallery');
  const basketView = new BasketView('#card-basket');
  const orderView = new OrderView(modal.content); // контейнер — контент модалки

  // 5) презентеры
  const catalogPresenter = new CatalogPresenter(catalogModel, catalogView, events, api);
  const basketPresenter  = new BasketPresenter(basketModel, basketView, events, catalogModel);
  const orderPresenter   = new OrderPresenter(orderModel, orderView, events, api, basketModel);

  // 6) старт
  catalogPresenter.init();
  basketPresenter.init();

  // === счётчик корзины в хедере ===
  const basketCounterEl = ensureElement<HTMLElement>('.header__basket-counter');
  const updateBasketCounter = () => {
    const count = basketModel.getItems().length;
    basketCounterEl.textContent = String(count);
  };
  updateBasketCounter();
  events.on(AppEvent.ProductAddedToBasket, updateBasketCounter);
  events.on(AppEvent.ProductRemovedFromBasket, updateBasketCounter);
  events.on(AppEvent.OrderCompleted, updateBasketCounter);

  // === НАВИГАЦИЯ ЧЕРЕЗ СОСТОЯНИЕ ===

  // 7) клики по каталогу -> в состояние product
  events.on<{ id: string }>(AppEvent.CatalogProductSelected, ({ id }) => {
    ui.navigate('product', { productId: id });
  });

  // 8) иконка корзины в шапке -> в состояние basket
  ensureElement<HTMLButtonElement>('.header__basket').addEventListener('click', () => {
    ui.navigate('basket');
  });

  // 9) завершение заказа -> в состояние success (с суммой)
  events.on<{ total: number }>(AppEvent.OrderCompleted, ({ total }) => {
    ui.navigate('success', { total });
  });

  // 10) реакция на смену состояния — один «контроллер» экранов
  events.on<IUiState>(AppEvent.ScreenChanged, (state) => {
    switch (state.screen) {
      case 'catalog': {
        modal.close();
        break;
      }

      case 'product': {
        const id = state.productId!;
        const product = catalogModel.getProductById(id);
        if (!product) return;

        const card = catalogView.createCardPreview(product);
        const btn = card.querySelector('.card__button') as HTMLButtonElement | null;

        const isPriceless = (product as any).price == null;
        const inBasket = (pid: string) =>
          typeof basketModel.hasItem === 'function'
            ? basketModel.hasItem(pid)
            : basketModel.getItems().some((i) => i.id === pid);

        if (btn) {
          if (isPriceless) {
            btn.textContent = 'Недоступно';
            btn.disabled = true;
          } else {
            const syncButton = () => {
              const exists = inBasket(product.id);
              btn.textContent = exists ? 'Убрать из корзины' : 'Купить';
              btn.classList.toggle('button_alt', exists);
              btn.disabled = false;
            };
            btn.addEventListener('click', () => {
              const exists = inBasket(product.id);
              if (exists) {
                events.emit(AppEvent.ProductRemovedFromBasket, { id: product.id });
              } else {
                events.emit(AppEvent.ProductAddedToBasket, { id: product.id });
              }
              // после действия — возвращаемся к каталогу
              ui.navigate('catalog');
            });
            syncButton();
          }
        }

        modal.open(card);
        break;
      }

      case 'basket': {
        const container = cloneTemplate<HTMLElement>('#basket');
        basketView.mount(container);
        basketView.renderBasket(basketModel.getItems(), basketModel.getTotal());

        basketView.bindDeleteClick((id) => {
          events.emit(AppEvent.ProductRemovedFromBasket, { id });
          basketView.renderBasket(basketModel.getItems(), basketModel.getTotal());
        });

        basketView.bindCheckoutClick(() => {
          // показываем оформление в той же модалке
          ui.navigate('order1');
        });

        modal.open(container);
        break;
      }

      case 'order1': {
        // OrderPresenter сам нарисует Stage1 в modal.content
        orderPresenter.init(); // внутри он переключит на Stage2 по «Далее»
        // модалка уже открыта (после корзины), но если пришли не из корзины — откроем пустой контейнер
        if (!document.body.contains(modal.content)) {
          const d = document.createElement('div');
          modal.open(d);
        }
        break;
      }

      case 'success': {
        const msg = new SuccessMessage();
        msg.setTotal(state.total ?? 0);
        msg.onClose(() => ui.navigate('catalog'));
        modal.open(msg.element);
        break;
      }
    }
  });
}

// безопасный старт один раз
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
