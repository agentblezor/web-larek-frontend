import { ensureElement, cloneTemplate } from '../utils/utils';
import { IBasketView } from '../types/views';
import { IBasketItem } from '../types/models';

export class BasketView implements IBasketView {
  private root?: HTMLElement;
  private listEl?: HTMLElement;
  private totalEl?: HTMLElement;
  private checkoutBtn?: HTMLButtonElement;
  private itemTemplate: HTMLTemplateElement;

constructor(itemTemplateSelector = '#card-basket') {
    this.itemTemplate = ensureElement<HTMLTemplateElement>(itemTemplateSelector);
  }

  mount(root: HTMLElement) {
    this.root = root;
    this.listEl = ensureElement<HTMLElement>('.basket__list', root);
    this.totalEl = ensureElement<HTMLElement>('.basket__price', root);
    this.checkoutBtn = ensureElement<HTMLButtonElement>('.basket__button', root);
  }

  private ensureMounted() {
    if (!this.root || !this.listEl || !this.totalEl || !this.checkoutBtn) {
      throw new Error('BasketView is not mounted');
    }
  }

  private formatPrice(price: number | null | undefined): string {
    if (price == null) return 'Бесценно';
    return `${new Intl.NumberFormat('ru-RU').format(price)} синапсов`;
  }

  renderBasket(items: IBasketItem[], total: number): void {
    this.ensureMounted();

    // очистить и отрисовать список позиций
    this.listEl!.innerHTML = '';
    items.forEach((item, i) => {
      const li = cloneTemplate<HTMLLIElement>(this.itemTemplate);
      li.dataset.id = item.id;

      const idx = li.querySelector('.basket__item-index') as HTMLElement | null;
      if (idx) idx.textContent = String(i + 1);

      const title = li.querySelector('.card__title') as HTMLElement | null;
      if (title) title.textContent = item.title;

      const price = li.querySelector('.card__price') as HTMLElement | null;
      if (price) price.textContent = this.formatPrice(item.price);

      this.listEl!.append(li);
    });

    // итог и состояние кнопки
    this.totalEl!.textContent = this.formatPrice(total);
    this.checkoutBtn!.disabled = items.length === 0;
  }

  bindDeleteClick(handler: (id: string) => void): void {
    this.ensureMounted();
    this.listEl!.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.basket__item-delete')) {
        const li = target.closest('.basket__item') as HTMLElement | null;
        const id = li?.dataset.id;
        if (id) handler(id);
      }
    });
  }

  bindCheckoutClick(handler: () => void): void {
    this.ensureMounted();
    this.checkoutBtn!.addEventListener('click', (e) => {
      e.preventDefault();
      if (!this.checkoutBtn!.disabled) handler();
    });
  }
}
