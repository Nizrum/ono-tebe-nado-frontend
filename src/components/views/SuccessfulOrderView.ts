import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";

interface ISuccessfulOrder {
	total: number;
}

export class SuccessfulOrder extends Component<ISuccessfulOrder> {
	protected _close: HTMLElement;

	constructor(container: HTMLElement, onClick: () => void) {
		super(container);

		this._close = ensureElement<HTMLElement>(
			".state__action",
			this.container
		);

		if (onClick) {
			this._close.addEventListener("click", onClick);
		}
	}
}
