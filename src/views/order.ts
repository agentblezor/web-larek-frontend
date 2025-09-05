import { IOrderView } from '../types/views';
import { cloneTemplate, ensureElement } from '../utils/utils';

type Payment = 'card' | 'cash';

export class OrderView implements IOrderView {
  constructor(private container: HTMLElement) {}

  private errorEl?: HTMLElement;

  // Шаг 1
  private form1?: HTMLFormElement;
  private btnCard?: HTMLButtonElement;
  private btnCash?: HTMLButtonElement;
  private addressInput?: HTMLInputElement;
  private nextBtn?: HTMLButtonElement;

  // Шаг 2
  private form2?: HTMLFormElement;
  private emailInput?: HTMLInputElement;
  private phoneInput?: HTMLInputElement;
  private payBtn?: HTMLButtonElement;

  renderStage1(): void {
    // КОРНЕВОЙ ЭЛЕМЕНТ ШАБЛОНА — ФОРМА
    const form = cloneTemplate<HTMLFormElement>('#order');
    this.form1 = form;

    this.btnCard = ensureElement<HTMLButtonElement>('button[name="card"]', form);
    this.btnCash = ensureElement<HTMLButtonElement>('button[name="cash"]', form);
    this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', form);
    this.nextBtn = ensureElement<HTMLButtonElement>('.order__button', form);
    this.errorEl = ensureElement<HTMLElement>('.form__errors', form);

    // по умолчанию ничего не выбрано (обе кнопки с .button_alt)
    this.setActivePayment(null);

    this.container.replaceChildren(form);
  }

  renderStage2(): void {
    // КОРНЕВОЙ ЭЛЕМЕНТ ШАБЛОНА — ФОРМА
    const form = cloneTemplate<HTMLFormElement>('#contacts');
    this.form2 = form;

    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', form);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', form);
    this.payBtn = ensureElement<HTMLButtonElement>('button[type="submit"]', form);
    this.errorEl = ensureElement<HTMLElement>('.form__errors', form);

    this.container.replaceChildren(form);
  }

  setErrors(message: string): void {
    if (this.errorEl) this.errorEl.textContent = message;
  }

  setNextEnabled?(enabled: boolean): void {
    if (this.nextBtn) this.nextBtn.disabled = !enabled;
  }

  setPayEnabled?(enabled: boolean): void {
    if (this.payBtn) this.payBtn.disabled = !enabled;
  }

  onPaymentSelect?(cb: (method: Payment) => void): void {
    this.btnCard?.addEventListener('click', (e) => {
      e.preventDefault();
      this.setActivePayment('card');
      cb('card');
    });
    this.btnCash?.addEventListener('click', (e) => {
      e.preventDefault();
      this.setActivePayment('cash');
      cb('cash');
    });
  }

  onAddressInput?(cb: (addr: string) => void): void {
    this.addressInput?.addEventListener('input', () => cb(this.addressInput!.value.trim()));
  }

  onAddressBlur?(cb: () => void): void {
    this.addressInput?.addEventListener('blur', cb);
  }

  onNextFromStage1?(cb: () => void): void {
    this.form1?.addEventListener('submit', (e) => { e.preventDefault(); cb(); });
    this.nextBtn?.addEventListener('click', (e) => { e.preventDefault(); cb(); });
  }

  onContactsInput?(cb: (v: { email: string; phone: string }) => void): void {
    const fire = () => cb({
      email: this.emailInput?.value.trim() ?? '',
      phone: this.phoneInput?.value.trim() ?? '',
    });
    this.emailInput?.addEventListener('input', fire);
    this.phoneInput?.addEventListener('input', fire);
  }

  onPay?(cb: () => void): void {
    this.form2?.addEventListener('submit', (e) => { e.preventDefault(); cb(); });
    this.payBtn?.addEventListener('click', (e) => { e.preventDefault(); cb(); });
  }

  // визуально отмечаем выбранный способ: активной кнопке снимаем .button_alt
  private setActivePayment(method: Payment | null) {
    this.btnCard?.classList.toggle('button_alt', method !== 'card');
    this.btnCash?.classList.toggle('button_alt', method !== 'cash');
  }
}
