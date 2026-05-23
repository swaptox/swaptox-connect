import { LitElement, html, css } from 'lit';

import './components/stxconnect-modal/stxconnect-modal';
import './components/stxconnect-nav/stxconnect-nav';
import './components/stxconnect-icon/stxconnect-icon-close';
import './components/stxconnect-injected/stxconnect-injected';
import './components/stxconnect-coinbase-wallet/stxconnect-coinbase-wallet';
import './components/stxconnect-walletconnect/stxconnect-walletconnect';

import { walletLogo, walletMap } from './data/walletList';
import { injectedConnector, lastUsedWallet } from '@swaptox/connect-core';

type LocalWallet = {
	index: number;
	id: string;
	info: {
		uuid?: string;
		rdns?: string;
		name?: string;
		icon?: string;
	};
};

const localProviders = new Map<string, LocalWallet>();

//提前监测是否有本地插件钱包
const warmupLocalWallets = async () => {
	try {
		const localWallets = await injectedConnector.detectWallets(1);
		localWallets.forEach((dt: LocalWallet) => localProviders.set(dt.info.uuid as string, {
			index: dt.index,
			info: dt.info,
			id: dt.id
		}));
	} catch (error) {}
};
void warmupLocalWallets();


function providerKey(wallet: LocalWallet): string {
	return wallet.info.uuid ?? wallet.info.rdns ?? wallet.id;
}

function delimitWalletsSort() {
	let index = 10;
	const rdnsObj: Record<string, number> = {};
	for (const key in walletMap) {
		const wallet = walletMap[key as keyof typeof walletMap];
		if (wallet.rdns) {
			rdnsObj[wallet.rdns] = index;
		}
		index++;
	}
	return rdnsObj;
}

function walletsSort(list: LocalWallet[]) {
	if (list.length === 0) return [];

	const lastConnect = lastUsedWallet();
	const lastRdns = lastConnect?.type === 'injected' ? lastConnect.id : '';
	const rdnsSort = delimitWalletsSort();

	return list
		.map((wallet) => {
			const rdns = wallet.info?.rdns ?? '';
			let index = Number(wallet.index);
			if (lastRdns === rdns) {
				index = 1;
			} else if (rdnsSort[rdns]) {
				index = rdnsSort[rdns];
			}
			return Object.assign({}, wallet, { index });
		})
		.sort((a, b) => Number(a.index) - Number(b.index));
}

export class SwaptoXConnect extends LitElement {
	static properties = {
		open: { type: Boolean, reflect: true },
		localWallets: { type: Array },
		selectedId: { type: String },
		selectedType: { type: String },
		selectedLogo: { type: String },
		selectedName: { type: String },
	};

	core!: any;
	open = false;
	localWallets: LocalWallet[] = [];
	selectedId = 'walletconnect';
	selectedType = 'walletconnect';
	selectedLogo = walletLogo.walletconnect;
	selectedName = 'WalletConnect';
	private _hasUserSelection = false;

	constructor() {
		super();
		this.localWallets = walletsSort(Array.from(localProviders.values()));
		this._selectDefaultWallet();
	}

	static styles = css`
		:host {
			display: none;
		}
		:host([open]) {
			display: block;
		}
		.container {
			position: relative;
			display: flex;
			flex-direction: row;
			height: 504px;
		}
		.content {
			position: relative;
			width: 420px;
			height: 100%;
		}
		.close-button {
			position: absolute;
			top: 15px;
			right: 15px;
			z-index: 500;
		}
	`;

	private _selectDefaultWallet() {
		if (this.localWallets.length > 0) {
			this.selectedId = 'injected';
			this.selectedType = 'injected';
			this.selectedLogo = '';
			this.selectedName = 'Injected';
			return;
		}

		this.selectedId = 'walletconnect';
		this.selectedType = 'walletconnect';
		this.selectedName = 'WalletConnect';
		this.selectedLogo = walletLogo.walletconnect;
	}

	private _dispatchError(source: string, error: unknown) {
		this.dispatchEvent(
			new CustomEvent('error', {
				detail: { source, error },
				bubbles: true,
				composed: true,
			}),
		);
	}

	private async _detectWalletsEIP6963(timeoutMs: number) {
		try {
			const detectedWallets = await injectedConnector.detectWallets(timeoutMs);
			for (const wallet of detectedWallets) {
				const localWallet = {
					index: wallet.index,
					info: wallet.info,
					id: wallet.id,
				};
				localProviders.set(providerKey(localWallet), localWallet);
			}

			const nextWallets = walletsSort(Array.from(localProviders.values()));
			if (JSON.stringify(nextWallets) !== JSON.stringify(this.localWallets)) {
				this.localWallets = nextWallets;
			}

			if (!this._hasUserSelection && this.selectedType === 'walletconnect') {
				this._selectDefaultWallet();
			}
		} catch (error) {
			this._dispatchError('detectWallets', error);
		}
	}

	openModal() {
		this.open = true;
		void this._detectWalletsEIP6963(120);
		void this._detectWalletsEIP6963(2000);
	}

	closeModal() {
		this.open = false;
	}

	private _handleClose(): void {
		this.closeModal();
		this.dispatchEvent(
			new CustomEvent('close', {
				bubbles: true,
				composed: true,
			}),
		);
	}

	private async _openWalletConnect() {
		this._handleClose();
		try {
			await this.core.wcProviderModal();
		} catch (error) {
			this._dispatchError('wcProviderModal', error);
		}
	}

	private _connectSuccess(res: CustomEvent) {
		this.dispatchEvent(
			new CustomEvent('connect', {
				detail: res.detail,
				bubbles: true,
				composed: true,
			}),
		);
	}

	private _selectWallet(event: CustomEvent) {
		this._hasUserSelection = true;
		this.selectedId = event.detail.id;
		this.selectedType = event.detail.type;
		this.selectedLogo = event.detail.logo;
		this.selectedName = event.detail.name;
	}

	render() {
		const hasInjectedWallets = this.localWallets.length > 0;

		return html`
			<stxconnect-modal @mask=${this._handleClose} ?open=${this.open}>
				<div class="container">
					<stxconnect-nav
						?injected=${hasInjectedWallets}
						.selectedid=${this.selectedId}
						@selected=${this._selectWallet}
					></stxconnect-nav>
					<div class="content">
						${this.open && this.selectedType === 'injected'
							? html`
									<stxconnect-injected
										.core=${this.core}
										.localWallets=${this.localWallets}
										@connect=${this._connectSuccess}
									></stxconnect-injected>
								`
							: null}

						${this.selectedType === 'coinbase-wallet'
							? html`
									<stxconnect-coinbase-wallet
										.core=${this.core}
										@connect=${this._connectSuccess}
									></stxconnect-coinbase-wallet>
								`
							: null}

						${this.open && this.selectedType === 'walletconnect'
							? html`
									<stxconnect-walletconnect
										.core=${this.core}
										?custom=${false}
										id=${this.selectedId}
										type=${this.selectedType}
										name=${this.selectedName}
										image=${this.selectedLogo}
										@connect=${this._connectSuccess}
										@assist-button=${this._openWalletConnect}
									></stxconnect-walletconnect>
								`
							: null}

						${this.open && this.selectedType === 'wallet-connect'
							? html`
									<stxconnect-walletconnect
										.core=${this.core}
										?custom=${true}
										id=${this.selectedId}
										type=${this.selectedType}
										name=${this.selectedName}
										image=${this.selectedLogo}
										@connect=${this._connectSuccess}
									></stxconnect-walletconnect>
								`
							: null}
					</div>

					<div class="close-button">
						<stxconnect-icon-close @close=${this._handleClose}></stxconnect-icon-close>
					</div>
				</div>
			</stxconnect-modal>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'swaptox-connect': SwaptoXConnect;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('swaptox-connect')) {
	customElements.define('swaptox-connect', SwaptoXConnect);
}
