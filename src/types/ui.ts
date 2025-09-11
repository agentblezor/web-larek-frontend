
export type Screen = 'catalog' | 'product' | 'basket' | 'order1' | 'order2' | 'success';

export interface IUiState {
  screen: Screen;
  productId?: string;
  total?: number;
}
