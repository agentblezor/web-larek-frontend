
import { Api, ApiListResponse } from '../components/base/api';
import { IProduct } from '../types/domain';
import { ICatalogModel } from '../types/models';
import { CDN_URL } from '../utils/constants';

declare const require: any;

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
  subtract: require('../images/Subtract.png') as string,
  logo: require('../images/logo.svg') as string,
  cart: require('../images/shopping_cart.svg') as string,
  asterisk: require('../images/Asterisk.png') as string,
};

export class CatalogModel implements ICatalogModel {
  private products: IProduct[] = [];

  constructor(private api: Api) {}

  async getProducts(): Promise<IProduct[]> {
    if (!this.products.length) {
      try {
        const response = await this.api.get('/products') as ApiListResponse<IProduct>;
        this.products = response.items.map((p) => ({
          ...p,
          image: /^https?:\/\//i.test(p.image) ? p.image : `${CDN_URL}/${p.image}`,
        }));
      } catch (e) {
        console.warn('Falling back to stub products due to API error:', e);
        // стабовые товары, чтобы главная не была пустой при недоступном API
        this.products = [
          {
            id: 'stub-1',
            title: 'БЭМ-пилюлька',
            description: 'Чтобы научиться правильно называть модификаторы, без этого не обойтись.',
            category: 'другое',
            image:  IMG.pilula,
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
            description: 'Лизните этот леденец, чтобы мгновенно запоминать и узнавать любой цветовой код CSS.',
            category: 'другое',
            image: IMG.shell,
            price: 1450,
          },
           {
            id: 'stub-6',
            title: 'Мамка-таймер',
            description: 'Будет стоять над душой и не давать прокрастинировать.',
            category: 'софт-скил',
            image: IMG.asterisk,
            price: null,
          },
           {
            id: 'stub-7',
            title: 'Кнопка «Замьютить кота»',
            description: 'Если орёт кот, нажмите кнопку.',
            category: 'кнопка',
            image: IMG.cat,
            price: 2000,
          },
           {
            id: 'stub-8',
            title: 'Портативный телепорт',
            description: 'Измените локацию для поиска работы.',
            category: 'другое',
            image: IMG.teleport,
            price: 100000,
          },
            {
            id: 'stub-9',
            title: 'Микровселенная в кармане',
            description: 'Даст время для изучения React, ООП и бэкенда',
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
      }
    }
    return this.products;
  }

  getProductById(id: string): IProduct | undefined {
    return this.products.find((p) => p.id === id);
  }
}

