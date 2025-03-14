import { CardView } from "./CardView";
import { LotStatus } from "../../types";
import { bem, ensureElement } from "../../utils/utils";

export type CatalogItemStatus = {
	status: LotStatus;
	label: string;
};

export class CatalogItemView extends CardView<CatalogItemStatus> {
	protected _status: HTMLElement;

	constructor(
		container: HTMLElement,
		onClick?: (event: MouseEvent) => void
	) {
		super("card", container, onClick);
		this._status = ensureElement<HTMLElement>(`.card__status`, container);
	}

	set status({ status, label }: CatalogItemStatus) {
		this.setText(this._status, label);
        this._status.className = "card__status";
        if (status === "active") {
            this._status.classList.add(bem(this.blockName, "status", "active").name);
        } else if (status === "closed") {
            this._status.classList.add(bem(this.blockName, "status", "closed").name);
        }
	}
}
