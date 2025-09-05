import { IProduct } from '../types/domain';
import { ICatalogView } from '../types/views';
import { cloneTemplate, ensureElement } from '../utils/utils';

// Модификаторы для бейджа категории
const CAT_MODS = [
  'card__category_soft',
  'card__category_hard',
  'card__category_other',
  'card__category_additional',
  'card__category_button',
];

const CAT_MAP: Record<string, string> = {
  'софт-скил': 'card__category_soft',
  'хард-скил': 'card__category_hard',
  'другое': 'card__category_other',
  'дополнительное': 'card__category_additional',
  'кнопка': 'card__category_button',
};

function applyCategoryBadge(el: HTMLElement, category: string) {
  el.classList.remove(...CAT_MODS);
  el.classList.add(CAT_MAP[category] ?? 'card__category_other');
  el.textContent = category;
}

export class CatalogView implements ICatalogView {
  private catalogEl: HTMLElement;
  private catalogTemplate: HTMLTemplateElement;
  private previewTemplate: HTMLTemplateElement;

  constructor(
    container: string | HTMLElement,
    catalogTemplateId = '#card-catalog',
    previewTemplateId = '#card-preview'
  ) {
    this.catalogEl =
      typeof container === 'string'
        ? ensureElement<HTMLElement>(container)
        : container;
    this.catalogTemplate = ensureElement<HTMLTemplateElement>(catalogTemplateId);
    this.previewTemplate = ensureElement<HTMLTemplateElement>(previewTemplateId);
  }

  private formatPrice(price: number | null | undefined): string {
    if (price == null) return 'Бесценно';
    return `${new Intl.NumberFormat('ru-RU').format(price)} синапсов`;
  }

  renderCatalog(products: IProduct[]): void {
    this.catalogEl.innerHTML = '';
    products.forEach((product) => {
      const card = cloneTemplate<HTMLButtonElement>(this.catalogTemplate);
      card.dataset.id = product.id;

      const titleEl = card.querySelector('.card__title') as HTMLElement | null;
      if (titleEl) titleEl.textContent = product.title;

      const priceEl = card.querySelector('.card__price') as HTMLElement | null;
      if (priceEl) priceEl.textContent = this.formatPrice((product as any).price);

      const catEl = card.querySelector('.card__category') as HTMLElement | null;
      if (catEl) applyCategoryBadge(catEl, product.category);

      const img = card.querySelector('.card__image') as HTMLImageElement | null;
      if (img && product.image) img.src = product.image;

      this.catalogEl.append(card);
    });
  }

  bindCardClick(handler: (id: string) => void): void {
    this.catalogEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('[data-id]') as HTMLElement | null;
      if (button?.dataset.id) handler(button.dataset.id);
    });
  }

  createCardPreview(product: IProduct): HTMLElement {
    const node = cloneTemplate<HTMLElement>(this.previewTemplate);

    const titleEl = node.querySelector('.card__title') as HTMLElement | null;
    if (titleEl) titleEl.textContent = product.title;

    const textEl = node.querySelector('.card__text') as HTMLElement | null;
    if (textEl) textEl.textContent = product.description;

    const catEl = node.querySelector('.card__category') as HTMLElement | null;
    if (catEl) applyCategoryBadge(catEl, product.category);

    const priceEl = node.querySelector('.card__price') as HTMLElement | null;
    if (priceEl) priceEl.textContent = this.formatPrice((product as any).price);

    const img = node.querySelector('.card__image') as HTMLImageElement | null;
    if (img && product.image) img.src = product.image;

    const btn = node.querySelector('.card__button') as HTMLButtonElement | null;
    if (btn && (product as any).price == null) {
      btn.textContent = 'Недоступно';
      btn.disabled = true;
    }

    return node;
  }
}
