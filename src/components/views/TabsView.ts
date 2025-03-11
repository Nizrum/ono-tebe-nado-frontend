import { Component } from "../base/Component";
import { ensureAllElements } from "../../utils/utils";

export type TabState = {
	selected: string;
};

export class TabsView extends Component<TabState> {
	protected _buttons: HTMLButtonElement[];

	constructor(container: HTMLElement, onClick?: (tab: string) => void) {
		super(container);

		this._buttons = ensureAllElements<HTMLButtonElement>(
			".button",
			container
		);

        if (onClick) {
            this._buttons.forEach((button) => {
                button.addEventListener("click", () => {
                    onClick(button.name);
                });
            });
        }
	}

	set selected(name: string) {
		this._buttons.forEach((button) => {
			this.toggleClass(
				button,
				"tabs__item_active",
				button.name === name
			);
			this.setDisabled(button, button.name === name);
		});
	}
}
