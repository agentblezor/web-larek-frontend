import { IOrderModel } from '../types/models';
import { IOrderView } from '../types/views';
import { IEvents } from '../components/base/events';
import { Api } from '../components/base/api';
import { AppEvent } from '../types/events';
import { BasketModel } from '../models/basket';

export class OrderPresenter {
  private touchedAddress = false;

  constructor(
    private model: IOrderModel,
    private view: IOrderView,
    private events: IEvents,
    private api: Api,
    private basket: BasketModel
  ) {}

  init() {
    this.initStage1();
  }

  private initStage1() {
  this.view.renderStage1();

  this.view.setErrors('');
  this.view.setNextEnabled?.(false);

 
  let suppressNextAddressBlur = false;

  // Выбор оплаты — сохраняем метод и подавляем ближайший blur адреса
  this.view.onPaymentSelect?.((method: 'card' | 'cash') => {
    this.model.setPaymentMethod(method);
    suppressNextAddressBlur = true;                // <- подавим след. blur
    // На случай других очередей событий:
    setTimeout(() => (suppressNextAddressBlur = false), 0);
    this.syncStage1Controls();
  });

  this.view.onAddressInput?.((addr: string) => {
    this.model.setAddress(addr);
    if (this.touchedAddress) {
      this.view.setErrors(this.model.isValidStage1() ? '' : 'Необходимо указать адрес');
    }
    this.syncStage1Controls();
  });

  // Потеря фокуса адреса — показываем ошибку, КРОМЕ случая после клика оплаты
  this.view.onAddressBlur?.(() => {
    if (suppressNextAddressBlur) {
      suppressNextAddressBlur = false;             // <- просто игнорируем этот blur
      return;
    }
    this.touchedAddress = true;
    this.view.setErrors(this.model.isValidStage1() ? '' : 'Необходимо указать адрес');
  });

  this.view.onNextFromStage1?.(() => {
    if (!this.model.isValidStage1()) {
      this.view.setErrors('Необходимо указать адрес');
      this.syncStage1Controls();
      return;
    }
    this.initStage2();
  });
}


  private syncStage1Controls() {
    // «Далее» активна только при валидном шаге
    this.view.setNextEnabled?.(this.model.isValidStage1());
  }

  private initStage2() {
    this.view.renderStage2();

    // ввод контактов
    this.view.onContactsInput?.(({ email, phone }) => {
      this.model.setContacts({ email, phone });
      const ok = this.model.isValidStage2();
      this.view.setPayEnabled?.(ok);
      this.view.setErrors(ok ? '' : 'Заполните e-mail и телефон');
    });

    // оплата
    this.view.onPay?.(async () => {
      if (!this.model.isValidStage2()) {
        this.view.setErrors('Заполните e-mail и телефон');
        return;
      }
      try {
        // вызов API оформления заказа по твоей логике...

const total = this.basket.getTotal();


this.events.emit(AppEvent.OrderCompleted, { total });


this.basket.clear();

      } catch {
        this.view.setErrors('Не удалось оформить заказ, попробуйте ещё раз');
      }
    });
  }
}
