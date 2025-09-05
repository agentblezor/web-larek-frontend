import { IEvents } from '../components/base/events';
import { Api, ApiListResponse } from '../components/base/api';
import { CDN_URL } from '../utils/constants';
import { IProduct } from '../types/domain';
import { ICatalogModel } from '../types/models';
import { ICatalogView } from '../types/views';
import { AppEvent } from '../types/events';

// для require(...) картинок
declare const require: any;

// Локальные заглушки (если API недоступно)
const IMG = {
  shell: require('../images/Shell.png') as string,
  flower: require('../images/Flower.png') as string,
  pilula: require('../images/Pilula.png') as string,
  dots: require('../images/Dots.png') as string,
  mithosis: require('../images/Mithosis.png') as string,
  cat: require('../images/Cat.png') as string,
  butterfly: require('../images/Butterfly.png') as string,
  leaf: require('../images/Leaf.png') as string,
  teleport: require('../images/Teleport.png') as string,
};

const STUB_PRODUCTS: IProduct[] = [
  {
    id: 'stub-1',
    title: 'БЭМ-пилюлька',
    description: 'Чтобы научиться правильно называть модификаторы, без этого не обойтись.',
    category: 'другое',
    image: IMG.pilula,
    price: 1500,
  },
  {
    id: 'stub-2',
    title: 'Фреймворк куки судьбы',
    description: 'Откройте эти куки, чтобы узнать, какой фреймворк вы должны изучить дальше.',
    category: 'софт-скил',
    image: IMG.flower,
    price: 2500,
  },
  {
    id: 'stub-3',
    title: '+1 час в сутках',
    description: 'Если планируете решать задачи в тренажёре, берите два.',
    category: 'дополнительное',
    image: IMG.dots,
    price: 750,
  },
  {
    id: 'stub-4',
    title: 'Бэкенд-антистресс',
    description: 'Если планируете решать задачи в тренажёре, берите два.',
    category: 'другое',
    image: IMG.mithosis,
    price: 1000,
  },
  {
    id: 'stub-5',
    title: 'HEX-леденец',
    description: 'Лизните — и моментально запоминаете любой CSS-цвет.',
    category: 'другое',
    image: IMG.shell,
    price: 1450,
  },
  {
    id: 'stub-6',
    title: 'Мамка-таймер',
    description: 'Будет стоять над душой и не давать прокрастинировать.',
    category: 'софт-скил',
    image: IMG.leaf,
    price: null, // бесценно
  },
  {
    id: 'stub-7',
    title: 'Кнопка «Замьютить кота»',
    description: 'Если орёт кот — нажмите.',
    category: 'кнопка',
    image: IMG.cat,
    price: 2000,
  },
  {
    id: 'stub-8',
    title: 'Портативный телепорт',
    description: 'Измените локацию для поиска работы.',
    category: 'другое',
    image: IMG.teleport,
    price: 100000,
  },
  {
    id: 'stub-9',
    title: 'Микровселенная в кармане',
    description: 'Даст время для изучения React, ООП и бэкенда.',
    category: 'другое',
    image: IMG.butterfly,
    price: 150000,
  },
  {
    id: 'stub-10',
    title: 'UI/UX-карандаш',
    description: 'Очень полезный навык для фронтендера. Без шуток.',
    category: 'хард-скил',
    image: IMG.leaf,
    price: 10000,
  },
];

export class CatalogPresenter {
  constructor(
    private model: ICatalogModel,
    private view: ICatalogView,
    private events: IEvents,
    private api: Api
  ) {}

  async init() {
    await this.loadProducts();
    this.view.renderCatalog(this.model.getProducts());
    this.view.bindCardClick((id: string) => {
  this.events.emit(AppEvent.CatalogProductSelected, { id });
});
  }

 private async loadProducts() {

  if (process.env.NODE_ENV !== 'production') {
    this.model.setProducts(STUB_PRODUCTS);
    return;
  }

  try {
    const res = await this.api.get('/products') as ApiListResponse<IProduct>;
    const items = res.items.map((p) => ({
      ...p,
      image: /^https?:\/\//i.test(p.image) ? p.image : `${CDN_URL}/${p.image}`,
    }));
    this.model.setProducts(items);
  } catch (e) {
    console.warn('Falling back to stub products due to API error:', e);
    this.model.setProducts(STUB_PRODUCTS);
  }
}
}