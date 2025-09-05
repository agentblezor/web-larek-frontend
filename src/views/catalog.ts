
import { IProduct } from '../types/domain';
import { ICatalogView } from '../types/views';
import { cloneTemplate, ensureElement } from '../utils/utils';


const MOD: Record<string, 'soft' | 'hard' | 'other' | 'additional' | 'button'> = {
  'софт-скил': 'soft',
  'хард-скил': 'hard',
  'другое': 'other',
  'дополнительное': 'additional',
  'кнопка': 'button',
};

function paintBadge(el: HTMLElement, category: string) {
  el.textContent = category;
  el.setAttribute('data-mod', MOD[category] ?? 'other');
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

      card.querySelector('.card__title')!.textContent = product.title;
      card.querySelector('.card__price')!.textContent =
        this.formatPrice((product as any).price);

      const catEl = card.querySelector('.card__category') as HTMLElement | null;
      if (catEl) paintBadge(catEl, product.category); // ← важно!

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

    node.querySelector('.card__title')!.textContent = product.title;
    node.querySelector('.card__text')!.textContent = product.description;

    const catEl = node.querySelector('.card__category') as HTMLElement | null;
    if (catEl) paintBadge(catEl, product.category); // ← важно!

    node.querySelector('.card__price')!.textContent =
      this.formatPrice((product as any).price);

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
