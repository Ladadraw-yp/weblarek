import { IApi,  IProduct, IOrderRequest, IProductsResponse } from '../../types';

export class ApiService {

  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  /* Получает список товаров с сервера  */
  getProducts(): Promise<IProduct[]> {
    return this.api
      .get<IProductsResponse>('/product/')
      .then((response) => response.items);
  }

  /* Отправляет заказ на сервер  */
  createOrder(data: IOrderRequest): Promise<IOrderRequest> {
    return this.api.post('/order/', data);
  }
}