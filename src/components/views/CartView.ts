import { Component } from "../base/Component";
import { createElement, ensureElement, formatNumber } from "../../utils/utils";
import { EventEmitter } from "../base/events";

interface ICartView {
	items: HTMLElement[];
	total: number;
	selected: string[];
}

export class CartView extends Component<ICartView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLElement;
	protected _actionsBar: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>(".cart__list", this.container);
		this._total = this.container.querySelector(".cart__total");
		this._button = this.container.querySelector(".cart__action");

		if (this._button) {
			this._button.addEventListener("click", () => {
				events.emit("order:open");
			});
		}

		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
			super.setDisabled(this._button, false);
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>("p", {
					textContent: "Корзина пуста",
				})
			);
			super.setDisabled(this._button, true);
		}
	}

	set selected(items: string[]) {
		if (items.length) {
			this.setDisabled(this._button, false);
		} else {
			this.setDisabled(this._button, true);
		}
	}

	set total(total: number) {
		this.setText(this._total, formatNumber(total));
	}
}
