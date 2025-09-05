// src/presenters/catalog.ts
import { ICatalogModel } from '../types/models';
import { ICatalogView } from '../types/views';
import { IEvents } from '../components/base/events';
import { AppEvent } from '../types/events';

export class CatalogPresenter {
  constructor(
    private model: ICatalogModel,
    private view: ICatalogView,
    private events: IEvents
  ) {}

  async init() {
    try {
      const products = await this.model.getProducts();
      this.view.renderCatalog(products);
      this.view.bindCardClick((id) => {
        this.events.emit(AppEvent.CatalogProductSelected, { id });
      });
    } catch (e) {
      console.error('CatalogPresenter init failed:', e);
    }
  }
}

