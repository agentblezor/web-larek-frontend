
import { ensureElement } from '../../utils/utils';

type SelOrEl = string | Element;

export abstract class View<TEl extends HTMLElement = HTMLElement> {
  protected el: TEl;
    private _aborts: AbortController[] = []; 

  constructor(root: string | TEl) {
    this.el = typeof root === 'string' ? ensureElement<TEl>(root) : root;
  }

  get element(): TEl {
    return this.el;
  }

  protected qs<E extends Element = Element>(sel: string, scope: ParentNode = this.el): E {
    const found = scope.querySelector<E>(sel);
    if (!found) throw new Error(`selector ${sel} not found`);
    return found;
  }

  protected qsa<E extends Element = Element>(sel: string, scope: ParentNode = this.el): E[] {
    return Array.from(scope.querySelectorAll<E>(sel));
  }

  protected setText(target: SelOrEl, text: string) {
    const el = typeof target === 'string' ? this.qs<HTMLElement>(target) : (target as HTMLElement);
    el.textContent = text;
  }

  protected setHTML(target: SelOrEl, html: string) {
    const el = typeof target === 'string' ? this.qs<HTMLElement>(target) : (target as HTMLElement);
    el.innerHTML = html;
  }

  protected setDisabled(target: SelOrEl, disabled: boolean) {
    const el = typeof target === 'string' ? this.qs<HTMLElement>(target) : (target as HTMLElement);
    (el as HTMLButtonElement | HTMLInputElement).disabled = disabled;
  }

  protected setHidden(target: SelOrEl, hidden: boolean) {
    const el = typeof target === 'string' ? this.qs<HTMLElement>(target) : (target as HTMLElement);
    el.classList.toggle('is-hidden', hidden);
    el.toggleAttribute('hidden', hidden);
  }

  protected toggleClass(target: SelOrEl, cls: string, force?: boolean) {
    const el = typeof target === 'string' ? this.qs<HTMLElement>(target) : (target as HTMLElement);
    el.classList.toggle(cls, force);
  }

  protected setAttr(target: SelOrEl, name: string, value: string | null) {
    const el = typeof target === 'string' ? this.qs<HTMLElement>(target) : (target as HTMLElement);
    if (value === null) el.removeAttribute(name);
    else el.setAttribute(name, value);
  }

protected on<K extends keyof HTMLElementEventMap>(
    target: SelOrEl,
    type: K,
    handler: (e: HTMLElementEventMap[K]) => void
  ) {
    const el = typeof target === 'string' ? this.qs<HTMLElement>(target) : (target as HTMLElement);
    const ac = new AbortController();
    el.addEventListener(type, handler as EventListener, { signal: ac.signal });
    this._aborts.push(ac);
  }

  /** Снять все обработчики, навешанные через on() */
  protected offAll() {
    this._aborts.forEach(a => a.abort());
    this._aborts = [];
  }
}
 

