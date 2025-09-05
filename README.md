# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```


Основные части архитектуры (MVP):

## Model

Хранит данные и реализует бизнес-логику:

- ProductModel — товар: id, название, описание, цена

- BasketModel — корзина: список товаров, сумма, добавление/удаление

- OrderModel — данные для оформления: оплата, адрес, email, phone

## View

Работа с DOM, UI и шаблонами:

- CatalogView — рендер каталога

- ModalView — открытие/закрытие модалок

- BasketView — корзина

- OrderView — форма оформления

## Presenter

Управляет процессами между model и view:

- CatalogPresenter — загрузка каталога, обработка кликов

- BasketPresenter — логика корзины

- OrderPresenter — этапы оформления

## Base

Общие классы и утилиты:

- Api — REST-клиент

- EventEmitter — система событий

- utils.ts — вспомогательные функции для DOM и BEM


Типы данных

- Product: id, title, description, image, price, category

- OrderData: payment (string), address, email, phone

- BasketItem: productId, count

- ApiResponse<T>: { total: number; items: T[] }

Общее

- Взаимодействие через EventEmitter

- Разделение ответственности (SRP)

- Модульная структура