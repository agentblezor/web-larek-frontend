import { IProduct } from '../types/domain';
import { ICatalogModel } from '../types/models';

export class CatalogModel implements ICatalogModel {
  private products: IProduct[] = [];

  setProducts(products: IProduct[]): void {
    this.products = products;
  }

  getProducts(): IProduct[] {
    return this.products;
  }

  getProductById(id: string): IProduct | undefined {
    return this.products.find((p) => p.id === id);
  }
}

