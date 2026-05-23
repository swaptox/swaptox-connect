import { LitElement, html, css, PropertyValues } from 'lit';

import '../stxconnect-logo/stxconnect-logo';
import '../stxconnect-connect-qr/stxconnect-connect-qr';
import '../stxconnect-button/stxconnect-button';
import './stxconnect-wallet-get';
import { sdkStore } from '../../store/store';
import { StoreMixin } from '../../store/state-mixin';

function formatText(template = '', values: Record<string, string>) {
	return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

export class StxconnectWalletconnect extends StoreMixin(LitElement) {
	static properties = {
		core: { attribute: false },
		loading: { type: Boolean },
		id: { type: String },
		type: { type: String },
		name: { type: String },
		image: { type: String },
		custom: { type: Boolean },
		getWallet: { type: Boolean },
	};

	core!: any;
	loading = true;
	id = '';
	type = '';
	name = '';
	image = '';
	custom = false;
	getWallet = false;

	protected updated(changed: PropertyValues) {
		if (changed.has('id')&&changed.get('id')!==this.id) {
			this.getWallet = false;
		}
	}

	static styles = css`
		:host {
			display: block;
			height: 100%;
		}
		.font-sans {
			font-family: var(--stxconnect-font-family);
			user-select: none;
			white-space: nowrap;
		}
		.header-title-body {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
		}
		.subtitle-ellipsis {
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			white-space: normal;
		}
		.stxc-theme-font-color {
			color: var(--stxconnect-font-color, #111);
		}
	`;

	_connectSuccess(e: CustomEvent) {
		this.dispatchEvent(
			new CustomEvent('connect', {
				detail: e.detail,
				bubbles: false,
				composed: false,
			}),
		);
	}

	async _openAssistButton() {
		if (this.custom) {
			this.getWallet = true;
			return;
		}
		this.dispatchEvent(
			new CustomEvent('assist-button', {
				detail: { custom: this.custom },
				bubbles: false,
				composed: false,
			}),
		);
	}

	render() {
		const $t = sdkStore.$t;
		const describeText = formatText(
			this.custom ? $t['assist-get-wallet'] : $t['assist-official'],
			{ name: this.name },
		);
		const assistButton = this.custom ? $t.get : $t.open;

		return html`
			<div class="header-title-body">
				<span class="font-sans stxc-theme-font-color" style="font-size: 20px; line-height: 58px;">
					${this.name}
				</span>
			</div>
			<div style="padding: 0 16px; height: calc(100% - 116px);">
				<stxconnect-connect-qr
					.core=${this.core}
					id=${this.id}
					type=${this.type}
					name=${this.name}
					image=${this.image}
					@connect=${this._connectSuccess}
				></stxconnect-connect-qr>
			</div>
			<div style="padding: 0 16px; height: 58px; display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
				<span class="font-sans subtitle-ellipsis" style="max-width: 300px; font-size: 14px; color: #999; flex: 1;">
					${describeText}
				</span>
				<stxconnect-button @change=${this._openAssistButton} variant="primary" size="small" ?plain=${true}>
					${assistButton}
				</stxconnect-button>
			</div>

			${this.getWallet
				? html`
						<stxconnect-wallet-get
							id=${this.id}
							name=${this.name}
							@back=${() => (this.getWallet = false)}
						></stxconnect-wallet-get>
					`
				: null}
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-walletconnect': StxconnectWalletconnect;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-walletconnect')) {
	customElements.define('stxconnect-walletconnect', StxconnectWalletconnect);
}
