import { ensureElement } from '../../utils/utils';
import { Form } from './Form'
import { IEvents } from '../base/Events';



interface IContactsForm {
  email?: string;
  phone?: string;
}

export class ContactsForm extends Form<IContactsForm> {
  formEmail: HTMLInputElement;
  formPhone: HTMLInputElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(events, container);

    this.formEmail = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
    this.formPhone = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

    this.formEmail.addEventListener('input', () => {
      this.events.emit('form:changed', { 
        key: 'email', 
        value: this.formEmail.value 
      });
    });
    this.formPhone.addEventListener('input', () => {
      this.events.emit('form:changed', { 
        key: 'phone', 
        value: this.formPhone.value 
      });
    });
    this.container.addEventListener('submit', (event) => {
      event.preventDefault();
      this.events.emit('contacts:submit');
    });
  }

  set email(value: string) {
    this.formEmail.value = value;
  }
  set phone(value: string) {
    this.formPhone.value = value;
  }
}