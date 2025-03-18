import { CardView } from "./CardView";
import { ensureElement, formatNumber } from "../../utils/utils";

export interface BidStatus {
	amount: number;
	status: boolean;
}

export class BidItemView extends CardView<BidStatus> {
	protected _amount: HTMLElement;
	protected _status: HTMLElement;
	protected _selector: HTMLInputElement;

	constructor(
		container: HTMLElement,
		onClick?: (event: MouseEvent) => void
	) {
		super("bid", container, onClick);
		this._amount = ensureElement<HTMLElement>(`.bid__amount`, container);
		this._status = ensureElement<HTMLElement>(`.bid__status`, container);
		this._selector = container.querySelector(`.bid__selector-input`);

		if (!this._button && this._selector && onClick) {
			this._selector.addEventListener("change", (event: MouseEvent) => {
				onClick(event);
			});
		}
	}

	set status({ amount, status }: BidStatus) {
		this.setText(this._amount, formatNumber(amount));

		if (status) this.setVisible(this._status);
		else this.setHidden(this._status);
	}
}
