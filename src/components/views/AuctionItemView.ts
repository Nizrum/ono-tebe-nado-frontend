import { ensureElement } from "../../utils/utils";
import { CardView } from "./CardView";

export class AuctionItemView extends CardView<HTMLElement> {
	protected _status: HTMLElement;

	constructor(
		container: HTMLElement,
		onClick?: (event: MouseEvent) => void
	) {
		super("lot", container, onClick);
		this._status = ensureElement<HTMLElement>(`.lot__status`, container);
	}

	set status(content: HTMLElement) {
		this._status.replaceWith(content);
	}
}
