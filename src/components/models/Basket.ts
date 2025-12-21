import { IProduct } from '../../types';

export class Basket{

  private items: IProduct[];
  
  constructor(){
    this.items = [];
  }

  /* возвращает массив товаров в корзине */
  getItems(): IProduct[] {
    return this.items
  }

  /* добавляет товар в корзину */
  addItem(product: IProduct): void {
    this.items.push(product);
  }

  /*  удаляет переданный товар из корзины */
  removeItem(product: IProduct): void {
    this.items = this.items.filter((item) => item.id !== product.id);
  }

  /* полностью очищает корзину */
  clear(): void {
    this.items = [];
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