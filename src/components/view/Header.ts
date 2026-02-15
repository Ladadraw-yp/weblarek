import { ensureElement } from "../../utils/utils.ts";
import { Component } from "../base/Component.ts";
import type { IEvents } from "../base/Events.ts";

interface IHeader {
  counter: number;
}

export class Header extends Component<IHeader> {
  protected basketButton: HTMLButtonElement;
  protected counterElement: HTMLElement;

  constructor( container: HTMLElement, protected events: IEvents ) {
    super(container);

    this.counterElement = ensureElement<HTMLElement>(".header__basket-counter",  this.container );
    this.basketButton = ensureElement<HTMLButtonElement>( ".header__basket", this.container );

    this.basketButton.addEventListener("click", () => {
      this.events.emit("basket:open");
    });
  }

  set counter(value: number) {
    this.counterElement.textContent = String(value);
  }
}
