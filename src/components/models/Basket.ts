import { IProduct } from '../../types';
import { IEvents } from "../base/Events";

export class Basket{

  private items: IProduct[];
  private events: IEvents;
  
  constructor(events: IEvents){
    this.items = [];
    this.events = events;
  }

  /* возвращает массив товаров в корзине */
  getItems(): IProduct[] {
    return this.items
  }

  getItemsId(): string[] {
    return this.items.map((item)=> item.id)
  }

  /* добавляет товар в корзину */
  addItem(product: IProduct): void {
    this.items.push(product);
    this.events.emit('basket:changed');
  }

  /*  удаляет переданный товар из корзины */
  removeItem(product: IProduct): void {
    this.items = this.items.filter((item) => item.id !== product.id);
    this.events.emit('basket:changed');
  }

  /* полностью очищает корзину */
  clear(): void {
    this.items = [];
    this.events.emit('basket:changed');
  }

  /* возвращает суммарную стоимость всех товаров в корзине */
  getTotalPrice(): number {
    return this.items.reduce((total, item) => {
      return total + (item.price ?? 0);
    }, 0); 
  }

  /* возвращает количество товаров в корзине */
  getItemsCount(): number {
    return this.items.length;
  }

  /* проверяет наличие товара в корзине по его id */
  hasItem(id: string): boolean  {
    return this.items.some((item) => item.id === id);   
  }

}