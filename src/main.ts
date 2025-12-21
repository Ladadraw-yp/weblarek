import './scss/styles.scss';

import { Catalog } from './components/models/Catalog';
import { Basket } from './components/models/Basket';
import { Buyer } from './components/models/Buyer';

import { apiProducts } from './utils/data';

import { Api } from './components/base/Api';
import { ApiService } from './components/services/ApiService';
import { API_URL } from './utils/constants';



// Catalog
console.log('===========================');
console.log ('Catalog');
console.log('===========================');
const productsModel = new Catalog();
productsModel.setProducts(apiProducts.items); 
console.log('Массив товаров из каталога: ', productsModel.getProducts());
console.log('Товар с ID="b06cde61-912f-4663-9751-09956c0eed67":', productsModel.getProductById('b06cde61-912f-4663-9751-09956c0eed67'));
productsModel.setSelectedProduct(apiProducts.items[1]); 
console.log('Выбранный товар: ', productsModel.getSelectedProduct());

// Basket
console.log('===========================');
console.log ('Basket');
console.log('===========================');
const BasketModel = new Basket();
BasketModel.addItem(apiProducts.items[1]);
BasketModel.addItem(apiProducts.items[3]);
console.log('Список товаров в корзине после добавления: ', BasketModel.getItems());
console.log('Суммарная стоимость всех товаров в корзине: ', BasketModel.getTotalPrice());
console.log('Количество товаров в корзине: ', BasketModel.getItemsCount());
BasketModel.removeItem(apiProducts.items[1]);
console.log('Список товаров в корзине после удаления: ', BasketModel.getItems());
console.log('Наличие товар с ID="b06cde61-912f-4663-9751-09956c0eed67" в корзине:', BasketModel.hasItem('b06cde61-912f-4663-9751-09956c0eed67'));
BasketModel.clear();
console.log('Список товаров в корзине после очистки: ', BasketModel.getItems());

// Basket
console.log('===========================');
console.log ('Buyer');
console.log('===========================');
const BuyerModel = new Buyer();
BuyerModel.setData({
    email: 'test@test.com',
    phone: '+11111111111',
    address: 'User Address',
    payment: 'online'
});
console.log('Данные пользователя: ', BuyerModel.getData());
BuyerModel.clear();
console.log('Данные пользователя после очистки: ', BuyerModel.getData());
BuyerModel.setData({
    email: 'test@test.com',
    address: 'User Address',
});
console.log('Проверка данных пользователя ', BuyerModel.validate())


console.log('===========================');
console.log('Проверка  подключения API');
console.log('===========================');

const api = new Api(API_URL);
const apiService = new ApiService(api);

(async () => {
    try {
        const products = await apiService.getProducts();
        console.log('Товары полученные c сервера:', products);
        
        productsModel.setProducts(products);
        console.log('и сохранены в productsModel:', productsModel.getProducts());
        
        console.log(`Количество товаров в каталоге: `, productsModel.getProducts().length);
        
        if (products.length > 1) {
            productsModel.setSelectedProduct(products[1]);
            console.log('Выбран второй товар для детального просмотра:', productsModel.getSelectedProduct());
        }
        
        console.log('ApiService.getProducts() работает корректно');
        
    } catch (error) {
        console.error('Ошибка при тестировании ApiService.getProducts():', error);
    }
})();


