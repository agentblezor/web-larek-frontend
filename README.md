# Веб-ларёк

Мини-интернет-магазин на **TypeScript** с архитектурой **MVP (Model–View–Presenter)**.  
UI — шаблоны в `<template>`, стили — **SCSS**, сборка — **Webpack**.

## Установка и запуск

```bash
npm i
npm run start        # http://localhost:8080
npm run build        # прод-сборка в dist/
```

Файл `.env` (см. `.env.example`):

```dotenv
API_URL=https://larek-api.nomoreparties.co/api/weblarek
CDN_URL=https://larek-api.nomoreparties.co
```

---

## Об архитектуре

Взаимодействия внутри приложения построены **через события** (event-driven).  
**Модели** дают/принимают данные; **представления** отвечают за DOM; **презентеры** «оркеструют» сценарии: подписываются на события от вьюх/моделей, эмитят свои события, вызывают методы моделей и вьюх.

Поток данных (кратко):

1. `CatalogPresenter` при старте делает `GET /products` через `Api`.  
2. На успех: нормализует картинки (через `CDN_URL`) → `CatalogModel.setProducts()` → `CatalogView.renderCatalog()`.  
3. Клик по карточке → `AppEvent.CatalogProductSelected` → модалка превью. Кнопка “Купить/Удалить” эмитит `ProductAddedToBasket` / `ProductRemovedFromBasket`.  
4. `BasketPresenter` слушает эти события, обновляет `BasketModel`, рендерит `BasketView` и счётчик в шапке.  
5. Клик “Оформить” → `AppEvent.CheckoutStarted` → `OrderPresenter` показывает шаги оформления (`OrderView`).  
6. После валидации `OrderPresenter` очищает корзину, открывает `SuccessMessage` с суммой и эмитит `AppEvent.OrderCompleted`.

---

## Структура проекта

```
src/
  components/base/
    api.ts           # REST-клиент
    events.ts        # EventEmitter
  models/            # данные/бизнес-логика
    catalog.ts
    basket.ts
    order.ts
  presenters/        # связывают model и view
    catalog.ts
    basket.ts
    order.ts
  views/
    catalog.ts
    basket.ts
    modal.ts
    order.ts         # + SuccessMessage
  pages/index.html   # шаблоны и контейнер модалки
  scss/              # стили
  images/            # локальные заглушки
  types/             # доменные и служебные типы
  utils/             # helpers: ensureElement, cloneTemplate, constants
  index.ts           # точка входа
```

---

## Компоненты и их API

> Общие операции с DOM используются через утилиты (`ensureElement`, `cloneTemplate`). При желании их можно оформить в базовый `Component` (методы `setText`, `setDisabled`, `setVisible`, `setAttr`, …) и унаследовать все вьюхи — это уберёт дублирование (DRY) и усилит ООП.

### Утилиты

- `ensureElement<T extends Element>(selector: string, root?: ParentNode): T` — ищет элемент, бросает ошибку если не найден. Типобезопасный возврат.  
- `cloneTemplate<T extends Element>(templateSelector: string): T` — клонирует `<template>` и возвращает корневой узел нужного типа.

### Событийная шина

`EventEmitter` — простая шина для общения компонентов.  
Методы: `on(event, handler)`, `off(event, handler)`, `emit(event, payload?)`.

---

### Models (данные и бизнес-логика)

#### `CatalogModel` — товары

```ts
constructor()
private products: IProduct[] = []

setProducts(products: IProduct[]): void
getProducts(): IProduct[]
getProductById(id: string): IProduct | undefined
```

**Назначение:** хранит загруженный список товаров и предоставляет быстрый доступ к нему.

---

#### `BasketModel` — корзина

```ts
constructor()
private items: IBasketItem[] = []

addItem(item: IBasketItem): void                // добавляет позицию
removeItem(id: string): void                    // удаляет по id
clear(): void                                   // очищает корзину
getItems(): IBasketItem[]                       // текущие позиции
getTotal(): number                              // сумма (исключая «Бесценно»)
hasItem(id: string): boolean                    // наличие товара в корзине
```

**Назначение:** управляет содержимым корзины и общей суммой.

---

#### `OrderModel` — оформление заказа

```ts
constructor()
private payment: 'card' | 'cash' | null
private address = ''
private email = ''
private phone = ''

setPaymentMethod(method: 'card' | 'cash'): void
setAddress(address: string): void
setContacts(data: Pick<IOrderFormData, 'email' | 'phone'>): void

getOrderData(): IOrderFormData                  // snapshot всех полей
isValidStage1(): boolean                        // адрес не пуст
isValidStage2(): boolean                        // простая проверка email/phone
```

**Назначение:** хранит данные формы и правила валидации двух шагов.

---

### Views (DOM и шаблоны)

#### `CatalogView` — каталог и превью карточки

```ts
constructor(
  container: string | HTMLElement,
  catalogTemplateId = '#card-catalog',
  previewTemplateId = '#card-preview'
)

renderCatalog(products: IProduct[]): void
bindCardClick(handler: (id: string) => void): void
createCardPreview(product: IProduct): HTMLElement
```

**Поведение:**
- Цена форматируется `Intl.NumberFormat('ru-RU')`; если `price == null`, показывается «Бесценно», кнопка «Купить» неактивна.
- Бейдж категории красится через `data-mod` (`soft|hard|other|additional|button`).

---

#### `BasketView` — модалка корзины

```ts
constructor(itemTemplateSelector = '#card-basket')

mount(root: HTMLElement): void
renderBasket(items: IBasketItem[], total: number): void
bindDeleteClick(handler: (id: string) => void): void
bindCheckoutClick(handler: () => void): void
```

**Поведение:** кнопка «Оформить» дизейблится, если корзина пустая.

---

#### `ModalView` — универсальная модалка

```ts
constructor(containerSelector = '#modal-container')

open(content: HTMLElement): void
close(): void
get content(): HTMLElement
```

**Поведение:** центрирование, оверлей, запрет прокрутки `body` во время показа.

---

#### `OrderView` — шаги оформления

```ts
constructor(container: HTMLElement)

// Шаг 1
renderStage1(): void
setErrors(message: string): void
setNextEnabled(enabled: boolean): void
onPaymentSelect(cb: (m: 'card' | 'cash') => void): void
onAddressInput(cb: (addr: string) => void): void
onAddressBlur(cb: () => void): void
onNextFromStage1(cb: () => void): void

// Шаг 2
renderStage2(): void
setPayEnabled(enabled: boolean): void
onContactsInput(cb: (v: { email: string; phone: string }) => void): void
onPay(cb: () => void): void
```

**UX:** сообщение **«Необходимо указать адрес»** появляется после первого `blur` и/или при клике «Далее». Кнопки способов оплаты визуально переключаются (активной убираем модификатор `button_alt`).

---

#### `SuccessMessage` — экран успеха

```ts
constructor(templateSelector = '#success')
element: HTMLElement                            // корневой узел для модалки
setTotal(total: number): void                   // «Списано N синапсов»
onClose(handler: () => void): void
```

---

### Presenters (сценарии и связи Model ↔ View)

#### `CatalogPresenter` — загрузка каталога и открытие превью

```ts
constructor(
  model: ICatalogModel,
  view: ICatalogView,
  events: IEvents,
  api: Api
)

init(): Promise<void>                           // loadProducts → render → bindCardClick
private loadProducts(): Promise<void>           // API → normalize → model.setProducts; заглушки при ошибке
```

---

#### `BasketPresenter` — управление корзиной и счётчиком

```ts
constructor(
  model: IBasketModel,
  view: IBasketView,
  events: IEvents,
  catalog: ICatalogModel
)

init(): void                                    // подписки, первичный рендер
```

Слушает:
- `ProductAddedToBasket { id }` / `ProductRemovedFromBasket { id }` — пересчёт корзины и ререндер,
- удаление позиции в `BasketView`,
- «Оформить» → эмит `CheckoutStarted`.

---

#### `OrderPresenter` — шаги оформления и финальный экран

```ts
constructor(
  model: IOrderModel,
  view: IOrderView,
  events: IEvents,
  api: Api,
  basket: IBasketModel
)

init(): void                                    // показать шаг 1
```

**Шаг 1:** `onPaymentSelect`, `onAddressInput`, `onAddressBlur`, `onNextFromStage1`; `setNextEnabled(model.isValidStage1())`, ошибки адреса.  
**Шаг 2:** `onContactsInput` → `setPayEnabled(isValidStage2)`; `onPay` → (валидация) → очистка корзины → `AppEvent.OrderCompleted({ total })` → показ `SuccessMessage`.

---

## API-клиент

`Api` — тонкая обёртка над `fetch`.

```ts
constructor(baseUrl: string, options: RequestInit = {})
// baseUrl — базовый адрес API
// options — общие опции для всех запросов (заголовки, credentials)

get<T>(path: string): Promise<T>
post<T>(path: string, body?: unknown, method: 'POST' | 'PUT' | 'PATCH' = 'POST'): Promise<T>
```

В `CatalogPresenter`:
- `GET /products` → `ApiListResponse<IProduct>`.
- Если `product.image` относительный — дополняем `CDN_URL`.
- Ошибки ловим в презентере (в конце цепочки) и подменяем на локальные заглушки.

---

## События приложения

```ts
enum AppEvent {
  CatalogProductSelected,   // payload: { id: string }
  ProductAddedToBasket,     // payload: { id: string }
  ProductRemovedFromBasket, // payload: { id: string }
  CheckoutStarted,          // payload: {}
  OrderCompleted            // payload: { total: number }
}
```

---

## Типы (доменные и служебные)

```ts
// Товар каталога
export interface IProduct {
  id: string;              // уникальный идентификатор товара
  title: string;           // название
  description: string;     // описание
  image: string;           // абсолютный или относительный URL изображения
  price: number | null;    // цена в "синапсах"; null = «Бесценно»
  category: string;        // категория: 'софт-скил' | 'хард-скил' | 'другое' | ...
}

// Позиция в корзине (модель для списка)
export interface IBasketItem {
  id: string;              // id товара
  title: string;           // название
  price: number | null;    // цена (null — не включаем в сумму)
}

// Данные оформления заказа
export interface IOrderFormData {
  payment: 'card' | 'cash' | null; // способ оплаты
  address: string;                 // адрес доставки
  email: string;                   // e-mail покупателя
  phone: string;                   // телефон покупателя
}

// Ответ API со списком
export interface ApiListResponse<T> {
  total: number;            // общее количество элементов
  items: T[];               // элементы
}
```

---

## Ответы на вопросы из ТЗ

- **Из каких частей состоит проект?**  
  Данные (Models), Отображения (Views), Оркестраторы (Presenters), Сервисы (`Api`, `EventEmitter`), Утилиты.

- **Зачем нужны части?**  
  Модели — чистые данные и бизнес-правила; Вьюхи — DOM и шаблоны; Презентеры — сценарии и координация; Сервисы — инфраструктура.

- **Как взаимодействуют?**  
  Через `EventEmitter`: вьюхи эмитят пользовательские действия, презентеры реагируют и вызывают методы моделей/вьюх; модели при необходимости инициируют события.

- **Какие данные используются?**  
  См. «Типы»: `IProduct`, `IBasketItem`, `IOrderFormData`, `ApiListResponse<T>`.

- **Как реализованы процессы?**  
  Event-driven. Презентеры — единые контроллеры сценариев. Сетевые запросы делаются в презентерах, завершаются установкой данных в модели и рендерами во вьюхи.

---

## Дальнейшие улучшения

- Вынести общие DOM-операции в базовый `Component` и отнаследовать все вьюхи (ОOП/DRY).
- Улучшить валидацию e-mail/телефона, обработку сетевых ошибок (ретраи, лоадеры).
- Покрыть unit-тестами модели и презентеры.

