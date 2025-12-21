import { IProduct } from '../../types';

export class Catalog {

  private products: IProduct[];
  private selectedProduct: IProduct | null;
  
  constructor() {
    this.products = [];
    this.selectedProduct = null;
  } 

  /* cохраняет массив товаров */ 
  setProducts(products: IProduct[]): void {
    this.products = products
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
  }

  /*возвращает товар, выбранный для подробного отображения */
  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }

}
