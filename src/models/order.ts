import { IOrderModel } from '../types/models';
import { IOrderFormData } from '../types/domain';

type Payment = 'card' | 'cash' | string;

export class OrderModel implements IOrderModel {
  private payment: Payment = '';
  private address = '';
  private email = '';
  private phone = '';

  setPaymentMethod(method: Payment): void {
    this.payment = method;
  }

  setAddress(address: string): void {
    this.address = address.trim();
  }

  setContacts(data: Pick<IOrderFormData, 'email' | 'phone'>): void {
    this.email = data.email.trim();
    this.phone = data.phone.trim();
  }

  getOrderData(): IOrderFormData {
    return {
      payment: this.payment,
      address: this.address,
      email: this.email,
      phone: this.phone,
    };
  }

  // Валидность шагов оформления
  isValidStage1(): boolean {
    return Boolean(this.address);
  }

  isValidStage2(): boolean {
    const emailOk = /\S+@\S+\.\S+/.test(this.email);
    const phoneOk = this.phone.replace(/\D/g, '').length >= 10;
    return emailOk && phoneOk;
  }
}
