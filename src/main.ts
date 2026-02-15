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

const productsModel = new Catalog(events);
const BasketModel = new Basket(events);
const BuyerModel = new Buyer(events);

let currentForm: "order" | "contacts" | null = null;

function renderBasket(): void {
  const items = BasketModel.getItems();
  const basketView = new BasketView( cloneTemplate(ensureElement<HTMLTemplateElement>("#basket")), events );
  const basketCards = items.map((item, index) => {
    const card = new BasketCard(
      cloneTemplate(ensureElement<HTMLTemplateElement>("#card-basket")), () => {
        events.emit("basket:remove", { id: item.id });
      },
    );

    return card.render({
      id: item.id,
      title: item.title,
      price: item.price,
      index: index + 1,
    });
  });
  modal.content = basketView.render({
    items: basketCards,
    total: BasketModel.getTotalPrice(),
  });
  modal.open();
}


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
  const preview = new PreviewCard(
    cloneTemplate(ensureElement<HTMLTemplateElement>("#card-preview")), () => {
      events.emit("preview:action", { id: product.id });
    },
  );

  modal.content = preview.render({
    title: product.title,
    image: product.image,
    category: product.category,
    price: product.price,
    description: product.description,
    buttonActive: isActive,
    buttonText: isActive ? BasketModel.hasItem(product.id) ? "Убрать из корзины" : "Купить" : "Недоступно",
  });

  modal.open();
});

events.on("card:select", (product: IProduct) => {
  if (product) {
    productsModel.setSelectedProduct(product);
  }
});

events.on("preview:action", (data: { id: string }) => {
  const product = productsModel.getProductById(data.id);
  if (product) {
    if (BasketModel.hasItem(data.id)) {
      BasketModel.removeItem(product);
    } else {
      BasketModel.addItem(product);
    }
    modal.close();
  }
});

events.on("basket:changed", () => {
  header.counter = BasketModel.getItemsCount();
});

events.on("basket:open", () => {
  renderBasket();
});

events.on("basket:remove", (product: IProduct) => {
  BasketModel.removeItem(product);
  renderBasket();
});


events.on("basket:checkout", () => {
  const buyerData = BuyerModel.getData();
  formOrder.payment = buyerData.payment;
  formOrder.address = buyerData.address;
  formOrder.error = "";

  const errors = BuyerModel.validate();
  formOrder.valid = !errors.payment && !errors.address;

  currentForm = "order";
  modal.content = formOrder.render();
  modal.open();
});


events.on("buyer:changed", () => {
  if (currentForm === "order") {
    formOrder.payment = BuyerModel.getData().payment;
  }
});

events.on("form:changed", (data: { key: string; value: any }) => {
  BuyerModel.setData({ [data.key]: data.value });
  const errors = BuyerModel.validate();

  if (currentForm === "order") {
    const orderErrors = [errors.payment, errors.address]
      .filter(Boolean)
      .join("; ");
    formOrder.error = orderErrors;
    formOrder.valid = !errors.payment && !errors.address;
  } else if (currentForm === "contacts") {
    const contactsErrors = [errors.email, errors.phone]
      .filter(Boolean)
      .join("; ");
    formContacts.error = contactsErrors;
    formContacts.valid = !errors.email && !errors.phone;
  }
});

events.on("order:submit", () => {
  const errors = BuyerModel.validate();
  
  if (!errors.payment && !errors.address) {
    const buyerData = BuyerModel.getData();
    formContacts.email = buyerData.email;
    formContacts.phone = buyerData.phone;
    formContacts.error = "";
    formContacts.valid = !errors.email && !errors.phone;

    currentForm = "contacts";
    modal.content = formContacts.render();
  }
});

events.on("contacts:submit", () => {
  const errors: TBuyerErrors = BuyerModel.validate();
  const hasErrors =
    errors.email || errors.phone || errors.payment || errors.address;
  if (hasErrors) {
    const allErrors = Object.values(errors).filter(Boolean).join("; ");
    if (allErrors) {
      formContacts.error = allErrors;
    }

    return;
  }

  const orderData: IOrderRequest = {
    ...BuyerModel.getData(),
    total: BasketModel.getTotalPrice(),
    items: BasketModel.getItemsId(),
  };

  apiService
    .createOrder(orderData)
    .then((response) => {
      success.total = response.total;
      currentForm = null;
      modal.content = success.render();

      BasketModel.clear();
      BuyerModel.clear();
    })
    .catch((error) => {
      console.error("Ошибка оформления заказа:", error);
      formContacts.error = "Ошибка оформления заказа";
    });
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
