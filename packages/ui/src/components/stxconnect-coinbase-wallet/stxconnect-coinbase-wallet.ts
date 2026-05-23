import { LitElement, html, css } from 'lit';

import '../stxconnect-logo/stxconnect-logo';
import '../stxconnect-loading-spinner/stxconnect-loading-spinner';
import '../stxconnect-button/stxconnect-button';
import { walletLogo } from '../../data/walletList';
import { sdkStore } from '../../store/store';
import { StoreMixin } from '../../store/state-mixin';

export class StxconnectCoinbaseWallet extends StoreMixin(LitElement) {
	static properties = {
		core: { attribute: false },
		loading: { type: Boolean },
		isError: { type: Boolean },
	};

	core!: any;
	loading = true;
	isError = false;
	private _connecting = false;
	private _destroyed = false;

	connectedCallback() {
		super.connectedCallback();
		this._destroyed = false;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._destroyed = true;
	}

	updated(changedProps: Map<string, any>) {
		if (changedProps.has('core') && this.core && !this._connecting) {
			void this._connectCoinbase();
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
		.stxconnect-coinbase-wallet {
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
		.stxc-theme-font-color {
			color: var(--stxconnect-font-color, #111);
		}
	`;

	private _emitError(error: unknown) {
		this.dispatchEvent(
			new CustomEvent('error', {
				detail: { source: 'coinbase-wallet', error },
				bubbles: true,
				composed: true,
			}),
		);
	}

	async _connectCoinbase() {
		if (this._connecting) return;
		this._connecting = true;
		this.loading = true;
		this.isError = false;

		try {
			const res = await this.core.connect({
				type: 'coinbase-wallet',
				id: 'coinbase-wallet',
			});
			if (this._destroyed) return;
			this.dispatchEvent(
				new CustomEvent('connect', {
					detail: res,
					bubbles: false,
					composed: false,
				}),
			);
		} catch (error) {
			if (this._destroyed) return;
			this.isError = true;
			this._emitError(error);
		} finally {
			if (this._destroyed) return;
			this.loading = false;
			this._connecting = false;
		}
	}

	render() {
		const $t = sdkStore.$t;

		return html`
			<div class="header-title-body">
				<span class="font-sans stxc-theme-font-color" style="font-size: 20px; line-height: 58px;">
					Coinbase Wallet
				</span>
			</div>
			<div style="padding: 0 16px; height: calc(100% - 116px);">
				<div class="stxconnect-coinbase-wallet">
					<stxconnect-loading-spinner
						image=${walletLogo['coinbase-wallet']}
						?loading=${this.loading}
						?iserror=${this.isError}
					></stxconnect-loading-spinner>

					<span class="font-sans stxc-theme-font-color" style="font-size: 20px; line-height: 50px;">
						${$t['connect-coinbase']}
					</span>

					<span class="font-sans" style="font-size: 14px; color: #999; line-height: 20px;">
						${$t['confirm-extension']}
					</span>

					<div style="height: 20px;"></div>

					<div style="height: 32px;">
						${!this.loading && this.isError
							? html`
									<stxconnect-button @change=${this._connectCoinbase} variant="warn" size="small" ?plain=${true}>
										${$t.retry}
									</stxconnect-button>
								`
							: null}
					</div>
				</div>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-coinbase-wallet': StxconnectCoinbaseWallet;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-coinbase-wallet')) {
	customElements.define('stxconnect-coinbase-wallet', StxconnectCoinbaseWallet);
}
