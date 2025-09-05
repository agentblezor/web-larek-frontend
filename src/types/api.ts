// Ответ от API при запросе списка
export interface ApiListResponse<T> {
  total: number;
  items: T[];
}

// Метод, который используется при отправке запроса
export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

// Интерфейс клиента API
export interface IApi {
  get<T>(uri: string): Promise<T>;
  post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}
