import "./scss/styles.scss";

import { Catalog } from "./components/models/Catalog";
import { Basket } from "./components/models/Basket";
import { Buyer } from "./components/models/Buyer";

import { EventEmitter } from "./components/base/Events";
import { ensureElement, cloneTemplate } from "./utils/utils";
import { IProduct, IOrderRequest, TBuyerErrors } from "./types";

import { Header } from "./components/view/Header";
import { Gallery } from "./components/view/Gallery";
import { CatalogCard } from "./components/view/CatalogCard";
import { Modal } from "./components/view/Modal";
import { PreviewCard } from "./components/view/PreviewCard";
import { BasketCard } from "./components/view/BasketCard";
import { BasketView } from "./components/view/BasketView";

import { OrderForm } from "./components/view/OrderForm";
import { ContactsForm } from "./components/view/ContactsForm";
import { Success } from "./components/view/Success";

import { Api } from "./components/base/Api";
import { ApiService } from "./components/services/ApiService";
import { API_URL } from "./utils/constants";

const api = new Api(API_URL);
const apiService = new ApiService(api);

const events = new EventEmitter();
const header = new Header( ensureElement<HTMLElement>(".header"), events );
const gallery = new Gallery( ensureElement<HTMLElement>(".gallery") );
const modal = new Modal( ensureElement<HTMLElement>("#modal-container"), events );
const formOrder = new OrderForm( cloneTemplate(ensureElement<HTMLTemplateElement>("#order")),  events );
const formContacts = new ContactsForm(cloneTemplate(ensureElement<HTMLTemplateElement>("#contacts")), events );
const success = new Success( cloneTemplate(ensureElement<HTMLTemplateElement>("#success")), events );
const basketView = new BasketView( cloneTemplate(ensureElement<HTMLTemplateElement>("#basket")), events );
const preview = new PreviewCard( cloneTemplate(ensureElement<HTMLTemplateElement>("#card-preview")), { onClick: () => events.emit("preview:action")  } );
    

const productsModel = new Catalog(events);
const basketModel = new Basket(events);
const buyerModel = new Buyer(events);

let currentForm: "order" | "contacts" | null = null;



events.on("catalog:changed", () => {
  const products = productsModel.getProducts();
  const cards = products.map((product) => {
    const card = new CatalogCard(
      cloneTemplate(ensureElement<HTMLTemplateElement>("#card-catalog")),
      {
        onClick: () => events.emit("card:select", product),
      },
    );
    return card.render(product);
  });
  gallery.list = cards;
});


events.on("product:changed", (data: { product: IProduct }) => {
  const product = data.product;
  const isActive = product.price ? true : false;
  
  modal.content = preview.render({
    title: product.title,
    image: product.image,
    category: product.category,
    price: product.price,
    description: product.description,
    buttonActive: isActive,
    buttonText: isActive ? basketModel.hasItem(product.id) ? "Убрать из корзины" : "Купить" : "Недоступно",
  });

  modal.open();
});

events.on("card:select", (product: IProduct) => {
  if (product) {
    productsModel.setSelectedProduct(product);
  }
});

events.on("preview:action", () => {
  const product = productsModel.getSelectedProduct();
  if (product) {
    if (basketModel.hasItem(product.id)) {
      basketModel.removeItem(product);
    } else {
      basketModel.addItem(product);
    }
    modal.close();
  }
});

events.on("basket:changed", () => {
  header.counter = basketModel.getItemsCount();

  const items = basketModel.getItems();  
  const basketCards = items.map((item, index) => {
    const card = new BasketCard(
      cloneTemplate(ensureElement<HTMLTemplateElement>("#card-basket")), () => {
        events.emit("basket:remove", { id: item.id });
      },
    );

    return card.render({
      title: item.title,
      price: item.price,
      index: index + 1,
    });
  });

  modal.content = basketView.render({
    items: basketCards,
    total: basketModel.getTotalPrice(),
  });   

});

events.on("basket:open", () => {
  modal.open();
  events.emit("basket:changed"); 
});

events.on("basket:remove", (product: IProduct) => {
  basketModel.removeItem(product);
});


events.on("basket:checkout", () => {
  currentForm = "order";
  modal.content = formOrder.render();
  modal.open();
});

events.on("modal:open", () => {
  if (currentForm === "order") {
    events.emit("buyer:changed");
  }
  if (currentForm === "contacts") {
    events.emit("buyer:changed");
  }
});

events.on("buyer:changed", () => {
  const buyer = buyerModel.getData();
  const errors = buyerModel.validate();
  if (currentForm === "order") {
    formOrder.payment = buyer.payment;
    formOrder.address = buyer.address;

    const orderErrors = [errors.payment, errors.address]
      .filter(Boolean)
      .join("; ");
    formOrder.error = orderErrors;

    formOrder.valid = !errors.payment && !errors.address // управляем доступностью кнопки
  }
  if (currentForm === "contacts") {
    formContacts.email = buyer.email;
    formContacts.phone = buyer.phone;

    const contactsErrors = [errors.email, errors.phone]
      .filter(Boolean)
      .join("; ");
    formContacts.error = contactsErrors;

    formContacts.valid = !errors.email && !errors.phone
  }
});

events.on("form:changed", (data: { key: string; value: any }) => {
  buyerModel.setData({ [data.key]: data.value });
});

events.on("order:submit", () => {
  currentForm = "contacts";
  modal.content = formContacts.render();
  events.emit("buyer:changed");
});

events.on("contacts:submit", () => {

  const orderData: IOrderRequest = {
    ...buyerModel.getData(),
    total: basketModel.getTotalPrice(),
    items: basketModel.getItemsId(),
  };

  apiService
    .createOrder(orderData)
    .then((response) => {
      success.total = response.total;
      currentForm = null;
      
      events.emit("order:success");
    })
    .catch((error) => {
      console.error("Ошибка оформления заказа:", error);
      formContacts.error = "Ошибка оформления заказа";
    });
});

events.on("order:success", () => {
  events.emit("userdata:clear");
  modal.content = success.render();
});

events.on("userdata:clear", () => {
  basketModel.clear();
  buyerModel.clear();
});

events.on("success:close", () => {
  modal.close();
});

// Загрузка товаров с сервера
apiService
  .getProducts()
  .then((data) => {
    console.log("Товары полученные c сервера:", data);
    productsModel.setProducts(data);
  })
  .catch((err) => console.error(err));
