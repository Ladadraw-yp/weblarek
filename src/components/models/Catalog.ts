import { IProduct } from '../../types';
import { IEvents } from "../base/Events";

export class Catalog {

  private products: IProduct[];
  private selectedProduct: IProduct | null;
  private events: IEvents;
  
  constructor(events: IEvents) {
    this.products = [];
    this.selectedProduct = null;
    this.events = events;
  } 

  /* cохраняет массив товаров */ 
  setProducts(products: IProduct[]): void {
    this.products = products;
    this.events.emit('catalog:changed');
  }
  
  /* возвращает массив всех товаров */
  getProducts(): IProduct[] {
    return this.products 
  }

  /* принимает id товара и возвращает найденный товар */
  getProductById(id: string): IProduct | undefined {
    return this.products.find((product) => product.id === id);
  }

  /* сохраняет товар для подробного отображения */
  setSelectedProduct(product: IProduct): void {
    this.selectedProduct = product;
    this.events.emit('product:changed', { product });
  }

  /*возвращает товар, выбранный для подробного отображения */
  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }

}
