import { LitElement, html, css } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import '../stxconnect-logo/stxconnect-logo';
import './stxconnect-expired-mask';

export class StxconnectConnectQr extends LitElement {
	static properties = {
		core: { attribute: false },
		svg: { state: true },
		loading: { type: Boolean },
		id: { type: String },
		type: { type: String },
		name: { type: String },
		image: { type: String },
		expirationTime: { type: Number },
	};

	core!: any;
	loading = true;
	svg = '';
	id = '';
	type = '';
	name = '';
	image = '';
	expirationTime = 0;
	private _requestId = 0;
	private _destroyed = false;

	connectedCallback() {
		super.connectedCallback();
		this._destroyed = false;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._destroyed = true;
		this._requestId++;
	}

	async _wcProviderQr() {
		if (!this.core || !this.id || !this.type) return;

		const requestId = ++this._requestId;
		this.loading = true;
		this.svg = '';

		try {
			await this.core.wcProviderQr({
				id: this.id,
				type: this.type,
				name: this.name,
				image: this.image,
				qrColor: 'var(--stxconnect-qr-detail-color)',
				bgColor: 'var(--stxconnect-qr-bg-color)',
				change: (event: any) => {
					if (this._destroyed || requestId !== this._requestId) return;
					this.svg = event.result;
					this.expirationTime = event.expirationTime;
					this.loading = false;
				},
				connect: (event: any) => {
					if (this._destroyed || requestId !== this._requestId) return;
					this.dispatchEvent(
						new CustomEvent('connect', {
							detail: event,
							bubbles: false,
							composed: false,
						}),
					);
				},
			});
		} catch (error) {
			if (this._destroyed || requestId !== this._requestId) return;
			this.loading = false;
			this.dispatchEvent(
				new CustomEvent('error', {
					detail: { source: 'wcProviderQr', error },
					bubbles: true,
					composed: true,
				}),
			);
		}
	}

	updated(changedProps: Map<string, any>) {
		const shouldRefresh = ['core', 'id', 'type', 'name', 'image'].some((prop) => changedProps.has(prop));
		if (shouldRefresh) {
			void this._wcProviderQr();
		}
	}

	static styles = css`
		:host {
			display: block;
		}
		.flex-center-body {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
		}
		.stxconnect-connect-qr-body {
			position: relative;
			height: 388px;
			width: 388px;
			border-radius: 18px;
			overflow: hidden;
			box-shadow: 0 0 0 1px var(--stxconnect-border-color, #ececec);
		}
		.css-3ggn2y {
			align-items: center;
			border-radius: 14px;
			display: flex;
			justify-content: center;
			overflow: hidden;
			position: relative;
		}
		.css-3ggn2y::before {
			background-color: initial;
			background-image: radial-gradient(var(--stxconnect-qr-loading-drop-color) 41%, transparent 41%);
			background-size: 2% 2%;
			content: "";
			inset: 0;
			position: absolute;
			z-index: 3;
		}
		@keyframes animation-hdxnm0 {
			from {
				background-position: 100% 0;
			}
			to {
				background-position: -100% 0;
			}
		}
		.css-3ggn2y::after {
			background-image: linear-gradient(90deg, rgba(0, 0, 0, 0) 50%, var(--stxconnect-qr-loading-color), rgba(0, 0, 0, 0));
			background-size: 200% 100%;
			content: "";
			position: absolute;
			transform: scale(1.5) rotate(45deg);
			z-index: 100;
			animation: 1000ms linear 0s infinite normal both running animation-hdxnm0;
			inset: 0;
		}
		.css-3ggn2y > span {
			background: var(--stxconnect-qr-loading-dots-color, #e4e4e4);
			border-radius: 14px;
			box-shadow: 0 0 0 4px var(--stxconnect-theme-bg);
			height: 11%;
			position: absolute;
			width: 11%;
			z-index: 4;
		}
		.css-3ggn2y > span::before {
			border-radius: 6px;
			box-shadow: 0 0 0 6px var(--stxconnect-theme-bg);
			content: "";
			inset: 12px;
			position: absolute;
		}
		.css-3ggn2y > span[data-v1] {
			left: 0;
			top: 0;
		}
		.css-3ggn2y > span[data-v2] {
			right: 0;
			top: 0;
		}
		.css-3ggn2y > span[data-v3] {
			bottom: 0;
			left: 0;
		}
		.wc-qr-body {
			position: relative;
			height: 340px;
			width: 340px;
			transform: scale(1.1);
			transform-origin: center center;
		}
		.wc-qr-body image {
			clip-path: inset(0 round 14px);
		}
	`;

	render() {
		return html`
			<div class="stxconnect-connect-qr-body flex-center-body">
				${this.loading
					? html`
							<div style="position: absolute; top: 14px; left: 14px;">
								<div class="css-3ggn2y" style="height: 360px; width: 360px;">
									<span data-v1="true"></span>
									<span data-v2="true"></span>
									<span data-v3="true"></span>
								</div>
							</div>
						`
					: html`<div class="wc-qr-body">${unsafeSVG(this.svg)}</div>`}

				${this.loading
					? null
					: html`
							<stxconnect-expired-mask 
								.expiredTime=${this.expirationTime} 
								@refresh=${this._wcProviderQr}
							></stxconnect-expired-mask>
						`}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-connect-qr': StxconnectConnectQr;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-connect-qr')) {
	customElements.define('stxconnect-connect-qr', StxconnectConnectQr);
}
