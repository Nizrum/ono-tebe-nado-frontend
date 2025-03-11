import _ from "lodash";

import { Model } from "../base/Model";
import { FormErrors, IAppState, ILot, IOrder, IOrderForm } from "../../types";
import { Lot } from "./LotModel"

export class AppState extends Model<IAppState> {
	cart: string[];
	catalog: Lot[];
	loading: boolean;
	order: IOrder = {
		email: "",
		phone: "",
		items: [],
	};
	preview: string | null;
	formErrors: FormErrors = {};

	toggleOrderedLot(id: string, isIncluded: boolean) {
		if (isIncluded) {
			this.order.items = _.uniq([...this.order.items, id]);
		} else {
			this.order.items = _.without(this.order.items, id);
		}
	}

	clearBasket() {
		this.order.items.forEach((id) => {
			this.toggleOrderedLot(id, false);
			this.catalog.find((it) => it.id === id).clearBid();
		});
	}

	getTotal() {
		return this.order.items.reduce(
			(a, c) => a + this.catalog.find((it) => it.id === c).price,
			0
		);
	}

	setCatalog(items: ILot[]) {
		this.catalog = items.map((item) => new Lot(item, this.events));
		this.emitChanges("items:changed", { catalog: this.catalog });
	}

	setPreview(item: Lot) {
		this.preview = item.id;
		this.emitChanges("preview:changed", item);
	}

	getActiveLots(): Lot[] {
		return this.catalog.filter(
			(item) => item.status === "active" && item.isParticipate
		);
	}

	getClosedLots(): Lot[] {
		return this.catalog.filter(
			(item) => item.status === "closed" && item.isMyBid
		);
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.validateOrder()) {
			this.events.emit("order:ready", this.order);
		}
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = "Необходимо указать email";
		}
		if (!this.order.phone) {
			errors.phone = "Необходимо указать телефон";
		}
		this.formErrors = errors;
		this.events.emit("formErrors:change", this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
