import { IModalView } from '../types/views';
import { ensureElement } from '../utils/utils';

export class ModalView implements IModalView {
  private container: HTMLElement;
  private closeButton: HTMLElement;
  private contentElement: HTMLElement;
  private outsideClickHandler?: (event: MouseEvent) => void;
  private keydownHandler?: (event: KeyboardEvent) => void;

  constructor(selector: string) {
    this.container = ensureElement<HTMLElement>(selector);
    this.contentElement = ensureElement('.modal__content', this.container);
    this.closeButton = ensureElement('.modal__close', this.container);

    // закрытие по крестику
    this.closeButton.addEventListener('click', () => this.close());
  }

  get root(): HTMLElement {
    return this.container;
  }
  get content(): HTMLElement {
    return this.contentElement;
  }

  open(content: HTMLElement): void {
    this.contentElement.innerHTML = '';
    this.contentElement.append(content);
    this.container.classList.add('modal_active');

    // клик по подложке
    const onBackdropClick = (event: MouseEvent) => {
      if (event.target === this.container) this.close();
    };
    this.outsideClickHandler = onBackdropClick;
    this.container.addEventListener('click', onBackdropClick);

    // закрытие по Esc
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') this.close();
    };
    this.keydownHandler = onKeydown;
    window.addEventListener('keydown', onKeydown);
  }

  close(): void {
    this.container.classList.remove('modal_active');
    if (this.outsideClickHandler) {
      this.container.removeEventListener('click', this.outsideClickHandler);
      this.outsideClickHandler = undefined;
    }
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = undefined;
    }
  }

  setCloseHandler(handler: () => void): void {
    this.closeButton.addEventListener('click', handler);
  }
}

