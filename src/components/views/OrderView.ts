import { FormView } from "./FormView";
import { IOrderForm } from "../../types";
import { IEvents } from "../base/events";

export class OrderView extends FormView<IOrderForm> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}

	set phone(value: string) {
		(
			this.container.elements.namedItem("phone") as HTMLInputElement
		).value = value;
	}

	set email(value: string) {
		(
			this.container.elements.namedItem("email") as HTMLInputElement
		).value = value;
	}
}
