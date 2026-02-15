import { ensureElement } from '../../utils/utils';
import { categoryMap, CDN_URL } from "../../utils/constants";
import { Card } from './Card';

interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

export interface ICatalogCard {
  image: string;
  category: string;
}

export class CatalogCard extends Card<ICatalogCard> {
  cardImage: HTMLImageElement;
  cardCategory: HTMLElement;

  constructor(container: HTMLElement, action?: ICardActions) {
    super(container);

    this.cardImage = ensureElement<HTMLImageElement>('.card__image', this.container);
    this.cardCategory = ensureElement<HTMLElement>('.card__category', this.container);
    
    if (action?.onClick) {
      this.container.addEventListener('click', action.onClick);
    }
  }

  set image(src: string) {
    this.cardImage.src = `${CDN_URL}/${src}`;
    this.cardImage.alt = this.cardTitle.textContent || 'Изображение товара';
  }

  set category(value: string) {
     this.cardCategory.textContent = value;
        if (value in categoryMap) {
            this.cardCategory.classList.add(categoryMap[value as keyof typeof categoryMap]);
        }
  }
}