import "./scss/styles.scss";

import { AuctionAPI } from "./components/models/AuctionAPI";
import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/events";
import { CatalogChangeEvent, Lot } from "./components/models/LotModel";
import { AppState } from "./components/models/AppModel";
import { PageView } from "./components/views/PageView";
import { BidItemView } from "./components/views/BidItemView";
import { AuctionView } from "./components/views/AuctionView";
import { AuctionItemView } from "./components/views/AuctionItemView";
import { CatalogItemView } from "./components/views/CatalogItemView";
import { cloneTemplate, createElement, ensureElement } from "./utils/utils";
import { ModalView } from "./components/views/ModalView";
import { CartView } from "./components/views/CartView";
import { TabsView } from "./components/views/TabsView";
import { IOrderForm } from "./types";
import { OrderView } from "./components/views/OrderView";
import { SuccessfulOrderView } from "./components/views/SuccessfulOrderView";

const events = new EventEmitter();
const api = new AuctionAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>("#card");
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>("#preview");
const auctionTemplate = ensureElement<HTMLTemplateElement>("#auction");
const cardCartTemplate = ensureElement<HTMLTemplateElement>("#bid");
const bidsTemplate = ensureElement<HTMLTemplateElement>("#bids");
const cartTemplate = ensureElement<HTMLTemplateElement>("#cart");
const tabsTemplate = ensureElement<HTMLTemplateElement>("#tabs");
const soldTemplate = ensureElement<HTMLTemplateElement>("#sold");
const orderTemplate = ensureElement<HTMLTemplateElement>("#order");
const successTemplate = ensureElement<HTMLTemplateElement>("#success");

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new PageView(document.body, events);
const modal = new ModalView(
	ensureElement<HTMLElement>("#modal-container"),
	events
);

// Переиспользуемые части интерфейса
const bids = new CartView(cloneTemplate(bidsTemplate), events);
const cart = new CartView(cloneTemplate(cartTemplate), events);
const tabs = new TabsView(cloneTemplate(tabsTemplate), (name) => {
	if (name === "closed") events.emit("cart:open");
	else events.emit("bids:open");
});
const order = new OrderView(cloneTemplate(orderTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

events.on<CatalogChangeEvent>("items:changed", () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new CatalogItemView(
			cloneTemplate(cardCatalogTemplate),
			() => events.emit("card:select", item)
		);
		return card.render({
			title: item.title,
			image: item.image,
			description: item.about,
			status: {
				status: item.status,
				label: item.statusLabel,
			},
		});
	});

	page.counter = appData.getClosedLots().length;
});

events.on("order:submit", () => {
	api.orderLots(appData.order)
		.then((result) => {
			const success = new SuccessfulOrderView(
				cloneTemplate(successTemplate),
				() => {
					modal.close();
					appData.clearCart();
					events.emit("auction:changed");
				}
			);

			modal.render({
				content: success.render({}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

events.on("formErrors:change", (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors;
	order.valid = !email && !phone;
	order.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join("; ");
});

events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

events.on("order:open", () => {
	modal.render({
		content: order.render({
			phone: "",
			email: "",
			valid: false,
			errors: [],
		}),
	});
});

events.on("bids:open", () => {
	modal.render({
		content: createElement<HTMLElement>("div", {}, [
			tabs.render({
				selected: "active",
			}),
			bids.render(),
		]),
	});
});

events.on("cart:open", () => {
	modal.render({
		content: createElement<HTMLElement>("div", {}, [
			tabs.render({
				selected: "closed",
			}),
			cart.render(),
		]),
	});
});

events.on("auction:changed", () => {
	page.counter = appData.getClosedLots().length;
	bids.items = appData.getActiveLots().map((item) => {
		const card = new BidItemView(cloneTemplate(cardCartTemplate), () =>
			events.emit("preview:changed", item)
		);
		return card.render({
			title: item.title,
			image: item.image,
			status: {
				amount: item.price,
				status: item.isMyBid,
			},
		});
	});
	let total = 0;
	cart.items = appData.getClosedLots().map((item) => {
		const card = new BidItemView(cloneTemplate(soldTemplate), (event) => {
			const checkbox = event.target as HTMLInputElement;
			appData.toggleOrderedLot(item.id, checkbox.checked);
			cart.total = appData.getTotal();
			cart.selected = appData.order.items;
		});
		return card.render({
			title: item.title,
			image: item.image,
			status: {
				amount: item.price,
				status: item.isMyBid,
			},
		});
	});
	cart.selected = appData.order.items;
	cart.total = total;
});

events.on("card:select", (item: Lot) => {
	appData.setPreview(item);
});

events.on("preview:changed", (item: Lot) => {
	const showItem = (item: Lot) => {
		const card = new AuctionItemView(cloneTemplate(cardPreviewTemplate));
		const auction = new AuctionView(
			cloneTemplate(auctionTemplate),
			(price) => {
				item.placeBid(price);
				auction.render({
					status: item.status,
					time: item.timeStatus,
					label: item.auctionStatus,
					nextBid: item.nextBid,
					history: item.history,
				});
			}
		);

		modal.render({
			content: card.render({
				title: item.title,
				image: item.image,
				description: item.description.split("\n"),
				status: auction.render({
					status: item.status,
					time: item.timeStatus,
					label: item.auctionStatus,
					nextBid: item.nextBid,
					history: item.history,
				}),
			}),
		});

		if (item.status === "active") {
			auction.focus();
		}
	};

	if (item) {
		api.getLotItem(item.id)
			.then((result) => {
				item.description = result.description;
				item.history = result.history;
				showItem(item);
			})
			.catch((err) => {
				console.error(err);
			});
	} else {
		modal.close();
	}
});

events.on("modal:open", () => {
	page.locked = true;
});

events.on("modal:close", () => {
	page.locked = false;
});

// Получаем лоты с сервера
api.getLotList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});
