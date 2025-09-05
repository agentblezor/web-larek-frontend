import { IBasketItem } from '../types/domain';
import { IBasketModel } from '../types/models';

export class BasketModel implements IBasketModel {
  private items: Map<string, IBasketItem> = new Map();

  getItems(): IBasketItem[] {
    return Array.from(this.items.values());
  }

  addItem(item: IBasketItem): void {
    this.items.set(item.id, item);
  }

  removeItem(id: string): void {
    this.items.delete(id);
  }

  clear(): void {
    this.items.clear();
  }

  getTotal(): number {
    return this.getItems().reduce((sum, item) => sum + item.price, 0);
  }

  hasItem(id: string): boolean {
    return this.items.has(id);
  }
}
