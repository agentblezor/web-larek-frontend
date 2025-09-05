import { IOrderFormData } from '../types/domain';
import { IOrderModel } from '../types/models';

export class OrderModel implements IOrderModel {
  private data: Partial<IOrderFormData> = {};

  setPaymentMethod(method: string): void {
    this.data.payment = method;
  }

  setAddress(address: string): void {
    this.data.address = address;
  }

  setContacts({ email, phone }: { email: string; phone: string }): void {
    this.data.email = email;
    this.data.phone = phone;
  }

  getOrderData(): IOrderFormData {
    return this.data as IOrderFormData;
  }

  isValidStage1(): boolean {
    return Boolean(this.data.payment && this.data.address);
  }

  isValidStage2(): boolean {
    return Boolean(this.data.email && this.data.phone);
  }
}
