import { LitElement, html, css } from 'lit';

import '../stxconnect-logo/stxconnect-logo';
import { customWallet, walletList, walletMap } from '../../data/walletList';
import { lastUsedWallet } from '@swaptox/connect-core';

import { sdkStore } from '../../store/store';
import { StoreMixin } from '../../store/state-mixin';
import { wcSdk } from '../../js_sdk/wcSdk';

export class StxconnectNav extends StoreMixin(LitElement) {
	static properties = {
		selectedid: { type: String },
		injected: { type: Boolean },
		lastConnectId: { type: String },
	};

	injected = false;
	selectedid = '';
	lastConnectId: string | null = '';
	CustomWallet = customWallet.map((wallet) => Object.assign({}, wallet));
	WalletList = walletList.map((wallet) => Object.assign({}, wallet));

	constructor() {
		super();
		const lastConnect = lastUsedWallet();
		this.lastConnectId = lastConnect?.type === 'injected' ? 'injected' : (lastConnect?.id ?? '');

		if (this.lastConnectId) {
			const index = this.WalletList.findIndex((wallet) => wallet.id === this.lastConnectId);
			if (index >= 0) {
				const [wallet] = this.WalletList.splice(index, 1);
				this.WalletList.unshift(Object.assign({}, wallet));
			}
		}
	}

	static styles = css`
		:host {
			display: block;
			width: 280px;
			height: 100%;
			overflow-y: auto;
			scrollbar-width: none;
			border-right: 1px solid var(--stxconnect-border-color, #e5e5e5);
			border: none;
			outline: none;
		}
		:host::-webkit-scrollbar {
			display: none;
		}
		.wallet-element {
			cursor: pointer;
			position: relative;
			padding: 0 7px;
			display: flex;
			flex-direction: row;
			align-items: center;
			column-gap: 6px;
			border-radius: 16px;
			box-shadow: 0 0 0 1px rgba(0, 0, 0, 0);
			height: 52px;
			transition:
				box-shadow .2s cubic-bezier(.4, 0, .2, 1),
				background-color .2s cubic-bezier(.4, 0, .2, 1),
				transform .2s cubic-bezier(.4, 0, .2, 1);
			-webkit-tap-highlight-color: transparent;
		}
		.wallet-element:hover {
			box-shadow: 0 0 0 1px rgba(2, 182, 166, .1);
			background-color: rgba(2, 182, 166, .1);
		}
		.wallet-element:active {
			transform: scale(0.96);
			transform-origin: center center;
		}
		.wallet-element.selected {
			box-shadow: 0 0 0 1px rgba(2, 182, 166, .5);
			background-color: rgba(2, 182, 166, .1);
			cursor: auto;
			pointer-events: none;
		}
		.font-sans {
			font-family: var(--stxconnect-font-family);
			user-select: none;
		}
		.stxc-theme-font-color {
			color: var(--stxconnect-font-color, #111);
		}
		
		
		.ellipsis{
			overflow: hidden;
			text-overflow: ellipsis !important;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1 !important;
			word-break:break-all;
		}
		
		
		.isLast-connect{
			pointer-events: none;
			position: absolute; top: 0; bottom: 0; right: 8px; display: flex; align-items: center;
		}
		
		
		.stxconnect-nav{}
		
		
		.wai-body{}
		.hide-wallet-name{
			flex: 1;
			display: flex;flex-direction: column;
		}
		
		@media (max-width: 700px) {
			.isLast-connect {
				top: -52px; bottom: 0; right: 0px;
			}
		}
		
		@media (max-width: 520px) {
			.hide-wallet-name {
				display: none;
			}
			.wai-body{
				width: 82px;
				min-width: 82px;
			}
			:host {
				width: 82px;
				min-width: 82px;
			}
			.isLast-connect{
				top: -52px; bottom: 0; right: 0px;left: 0;
				transform: scale(0.8);
				transform-origin: center center;
			}
			.stxconnect-nav{
				background-color: var(--stxconnect-content-bg);
			}
		}
	`;

	selectWallet(id: string) {
		const wallet = [...this.CustomWallet, ...this.WalletList].find((item) => item.id === id);
		if (!wallet) return;

		this.dispatchEvent(
			new CustomEvent('selected', {
				detail: wallet,
				bubbles: false,
				composed: false,
			}),
		);
	}

	renderWalletItem(wallet: any, isList: boolean) {
		if (this.injected === false && wallet.id === 'injected') {
			return null;
		}
		if(isList&&wcSdk.isMobile()){
			const walletId: string | undefined = typeof wallet?.id === 'string' ? wallet.id : undefined;
			const mobile = walletMap[walletId as keyof typeof walletMap]?.mobile;
			if (!mobile?.native && !mobile?.universal) {
			    return null;
			}
		}

		const isSelected = this.selectedid === wallet.id;
		const isLastConnect = this.lastConnectId === wallet.id;
		const $t = sdkStore.$t;
		const subtitle = $t[wallet.subtitle] ?? wallet.subtitle;

		return html`
			<div class="wai-body">
				<div style="padding: 4px 15px;">
					<div class="wallet-element ${isSelected ? 'selected' : ''}" @click=${() => this.selectWallet(wallet.id)}>
						<stxconnect-logo
							size="38px"
							radius="12px"
							src=${wallet.logo}
							border=${wallet.border}
						></stxconnect-logo>

						<div class="hide-wallet-name">
							<div class="font-sans stxc-theme-font-color ellipsis" style="flex: 1;font-size: 14px; line-height: 22px;">
								${wallet.name}
							</div>
							<div class="font-sans ellipsis" style="flex: 1;font-size: 11px; color: #999; line-height: 16px;">
								${subtitle}
							</div>
						</div>

						${isLastConnect
							? html`
									<div class="isLast-connect">
										<div
											class="font-sans"
											style="
												background-color: var(--stxconnect-last-used-bg);
												border-radius: 122px;
												padding: 0 8px;
												box-shadow: 0 0 0 1px #169810;
												color: var(--stxconnect-last-used-text);
												font-size: 11px;
												white-space: nowrap;
												line-height: 20px;
											"
										>
											${$t['last-used']}
										</div>
									</div>
								`
							: null}
					</div>
				</div>
			</div>
		`;
	}

	render() {
		return html`
			<div class="stxconnect-nav" style="padding: 15px 0;">
				${this.CustomWallet.map((wallet) => this.renderWalletItem(wallet, false))}
				${this.WalletList.map((wallet) => this.renderWalletItem(wallet, true))}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-nav': StxconnectNav;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-nav')) {
	customElements.define('stxconnect-nav', StxconnectNav);
}
