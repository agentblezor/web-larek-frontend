
import './scss/styles.scss';

import { CatalogModel } from './models/catalog';
import { BasketModel } from './models/basket';
import { OrderModel } from './models/order';

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

  // 4) представления
  const modal = new ModalView('#modal-container');
  const catalogView = new CatalogView('.gallery');
  const basketView = new BasketView('#card-basket');
  const orderView = new OrderView(modal.content); // контейнер контента модалки

  // 5) презентеры
const catalogPresenter = new CatalogPresenter(
  catalogModel,
  catalogView,
  events,
  api                          
);
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

  // 7) карточка в модалке (с учётом «Бесценно»)
  events.on<{ id: string }>(AppEvent.CatalogProductSelected, ({ id }) => {
    const product = catalogModel.getProductById(id);
    if (!product) return;

    const card = catalogView.createCardPreview(product);
    const btn = card.querySelector('.card__button') as HTMLButtonElement | null;

    const isPriceless = (product as any).price == null;

    // проверка: товар уже в корзине?
    const inBasket = (pid: string) =>
      typeof basketModel.hasItem === 'function'
        ? basketModel.hasItem(pid)
        : basketModel.getItems().some((i) => i.id === pid);

    if (btn) {
      if (isPriceless) {
        // бесценные — недоступны к покупке
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
            modal.close();
          } else {
            events.emit(AppEvent.ProductAddedToBasket, { id: product.id });
            modal.close();
          }
        });

        syncButton();
      }
    }

    modal.open(card);
  });

  // 8) Открытие корзины по иконке в шапке
  ensureElement<HTMLButtonElement>('.header__basket').addEventListener('click', () => {
    const container = cloneTemplate<HTMLElement>('#basket');

    // монтируем и первично рендерим
    basketView.mount(container);
    basketView.renderBasket(basketModel.getItems(), basketModel.getTotal());

    // удаление позиции из корзины + мгновенный перерендер
    basketView.bindDeleteClick((id) => {
      events.emit(AppEvent.ProductRemovedFromBasket, { id });
      basketView.renderBasket(basketModel.getItems(), basketModel.getTotal());
    });

    // переход к оформлению — рисуем Шаг 1 в этой же модалке
    basketView.bindCheckoutClick(() => {
      orderPresenter.init();
    });

    modal.open(container);
  });

  // 9) Экран «успех» с суммой списанных синапсов
events.on<{ total: number }>(AppEvent.OrderCompleted, ({ total }) => {
  const msg = new SuccessMessage();        
  msg.setTotal(total);                     
  msg.onClose(() => modal.close());        
  modal.open(msg.element);                 
});


  
}

// безопасный старт один раз
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
