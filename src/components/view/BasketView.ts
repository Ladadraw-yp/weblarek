import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";


interface IBasketView {
  items: HTMLElement[];
  total: number;
}

export class BasketView extends Component<IBasketView> {
  protected listElement: HTMLElement;
  protected totalElement: HTMLElement;
  protected button: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    private readonly events: IEvents,
  ) {
    super(container);
    this.listElement = ensureElement<HTMLElement>(".basket__list", this.container );
    this.totalElement = ensureElement<HTMLElement>(".basket__price", this.container );
    this.button = ensureElement<HTMLButtonElement>( ".basket__button", this.container );
    this.button.addEventListener("click", () => {
      this.events.emit("basket:checkout");
    });

    this.setButtonDisabled(true);
  }

  protected setButtonDisabled(state: boolean): void {
      this.button.disabled = state;
  }

  set items(items: HTMLElement[]) {
    this.listElement.replaceChildren(...items);
    this.setButtonDisabled(items.length === 0);
  }

  set total(value: number) {
    this.totalElement.textContent = `${value} синапсов`;
  }
  
}
