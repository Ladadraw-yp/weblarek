export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface IBuyer {
  payment: TPayment;
  address: string;
  email: string;
  phone: string;
}

export type TPayment = 'card' | 'cash' | null;

export type TBuyerErrors = Partial<Record<keyof IBuyer, string>>

export interface IProductsResponse {
  items: IProduct[];
}

export interface IOrderRequest {
  payment: TPayment;
  address: string;
  email: string;
  phone: string;
  items: string[];
  total: number;
}
