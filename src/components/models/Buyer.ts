import { IBuyer, TPayment, TBuyerErrors } from '../../types';
import { IEvents } from "../base/Events";

export class Buyer {

  private payment: TPayment;
  private address: string;
  private email: string;
  private phone: string;
  private events: IEvents;
  

  constructor(events: IEvents) {
    this.payment = null;
    this.address = "";    
    this.email = "";
    this.phone = "";
    this.events = events;
  }
  
  /* сохраняет данные покупателя */
  setData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) {
      this.payment = data.payment;
    }
    if (data.address !== undefined) {
      this.address = data.address;
    }
    if (data.email !== undefined) {
      this.email = data.email;
    }
    if (data.phone !== undefined) {
      this.phone = data.phone;
    }
    this.events.emit('buyer:changed');
  }

  /* возвращает все данные покупателя */
  getData(): IBuyer {
    return {
      payment: this.payment,
      address: this.address,
      email: this.email,
      phone: this.phone      
    }
  }
  
  /* очищает все данные покупателя */
  clear(): void {
    this.payment = null;
    this.address = "";
    this.email = "";
    this.phone = "";
    this.events.emit('buyer:changed');
  }
  
  /* выполняет валидацию данных покупателя */
  validate(): TBuyerErrors {
    const errors: TBuyerErrors = {};

    if (!this.payment) {
      errors.payment = 'Не выбран вид оплаты';
    }
    if (!this.address.trim()) {
      errors.address = 'Укажите адрес';
    }
    if (!this.email.trim()) {
      errors.email = 'Укажите email';
    }
    if (!this.phone.trim()) {
      errors.phone = 'Укажите телефон';
    }
    return errors;
  }

}
