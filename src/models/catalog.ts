import { IProduct } from '../types/domain';
import { ICatalogModel } from '../types/models';

export class CatalogModel implements ICatalogModel {
  private _products: IProduct[] = [];

  setProducts(products: IProduct[]): void {
    this._products = products;
  }

  getProducts(): IProduct[] {
    return this._products;
   
  }

  getProductById(id: string): IProduct | undefined {
    return this._products.find((p) => p.id === id);
  }
}

