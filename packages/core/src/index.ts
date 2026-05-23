import type { Chain } from 'viem';

import { PREFIX, COINBASE_INFO, WALLETCONNECT_INFO } from './data/index';
import { GET_CHAINS, DEFAULT_CHAINS } from './js_sdk/chains';
import { connect } from './js_sdk/connect';
import { createQrSvg } from './js_sdk/createQrSvg';
import {
	getStorageItem,
	lastUsedWallet,
	setStorageItem
} from './js_sdk/lastUsedWallet';
import { injectedConnector } from './com/injectedConnector/index';
import { coinbaseWallet } from './com/coinbaseWallet/index';
import { wcConnector } from './com/walletConnect/index';
import {
	WalletConnectConnection,
	type ConnectType,
	type EventCallback,
	type WalletConnectCallbacks,
	type WalletInfo,
	type WalletProvider
} from './com/walletConnect/connect';
import { addChain } from './provider/addChain';
import { getChainId } from './provider/getChainId';
import { switchChain } from './provider/switchChain';

export { createQrSvg };
export { lastUsedWallet };
export { injectedConnector };
export { coinbaseWallet };
export { wcConnector };

export class WalletCore {
	chains: Chain[];
	currentChain: Chain;
	accounts: string[] = [];

	provider: WalletProvider | null = null;
	coinbaseCore: any = null;
	wcCore: any = null;
	private _connectedInfo: WalletInfo = {};

	events: Record<string, EventCallback[]> = {};

	private _activeProvider: any = null;
	private _activeProviderListeners: Record<string, EventCallback> = {};
	private walletConnect: WalletConnectConnection;
	private _disconnecting = false;

	constructor(config: any = {}) {
		this.chains = this._resolveChains(config.chains);
		this.currentChain = this._resolveCurrentChain(config.currentChain);

		this.coinbaseCore = coinbaseWallet({
			appName: config?.metadata?.name,
			appLogo: config?.metadata?.logo
		});

		this.wcCore = wcConnector({
			projectId: config?.projectId,
			//chains: [this.currentChain.id],// DEPRECATED, use `optionalChains` instead
			optionalChains: this.chains.map(chain => chain.id),
			metadata: {
				name: config?.metadata?.name,
				description: config?.metadata?.description,
				url: config?.metadata?.url,
				icons: config?.metadata?.logo ? [config.metadata.logo] : []
			},
			rpcMap: config?.rpcMap ?? {}
		});

		this.walletConnect = new WalletConnectConnection({
			wcCore: this.wcCore,
			getCurrentProvider: () => this.provider,
			clearCurrentWalletConnectProvider: () => {
				this._unbindActiveProviderEvents();
				this.provider = null;
				this._setConnected(false);
			},
			completeConnection: input => this._completeConnection(input),
			waitAuthorizedAccounts: provider => this._waitAuthorizedAccounts(provider),
			emit: (event, data) => this.emit(event, data),
			handleAccountsChanged: accounts => this._handleAccountsChanged(accounts),
			handleDisconnect: error => {
				const currentProvider = this.provider;
				if (currentProvider && !this.wcCore?.isProvider?.(currentProvider)) return;

				this._unbindActiveProviderEvents();
				this.provider = null;
				this.accounts = [];
				this._setConnected(false);

				if (!this._disconnecting) {
					this.emit('disconnect', error);
				}
			}
		});
	}

	/*
	|--------------------------------------------------------------------------
	| WalletConnect
	|--------------------------------------------------------------------------
	*/

	async wcProviderModal() {
		return await this.walletConnect.providerModal();
	}

	async wcProvider(fun: WalletConnectCallbacks, wallet: any = {}) {
		return await this.walletConnect.provider(fun, wallet);
	}

	async wcProviderQr(obj: any) {
		return await this.walletConnect.providerQr(obj);
	}

	/*
	|--------------------------------------------------------------------------
	| Event System
	|--------------------------------------------------------------------------
	*/

	on(key: string, callback: EventCallback) {
		if (!this.events[key]) {
			this.events[key] = [];
		}
		this.events[key].push(callback);
		return () => this.off(key, callback);
	}

	off(key: string, callback: EventCallback) {
		if (!this.events[key]) return;
		this.events[key] = this.events[key].filter(fn => fn !== callback);
	}

	emit(key: string, data?: any) {
		if (!this.events[key]) return;
		for (const callback of [...this.events[key]]) {
			try {
				callback(data);
			} catch (err) {
				console.error(err);
			}
		}
	}

	/*
	|--------------------------------------------------------------------------
	| Connect
	|--------------------------------------------------------------------------
	*/

	async connect(param: any) {
		if (!param?.type) {
			throw new Error('Connect type is required');
		}

		let info: WalletInfo = {};
		let provider: WalletProvider;
		let accounts: string[];
		const storageId = param.id ?? param.type;

		if (param.type === 'injected') {
			if (!param.id) {
				throw new Error('Injected wallet id is required');
			}
			const res = await injectedConnector.searchWallet(param.id);
			if (!res?.provider) {
				throw new Error('Wallet does not exist');
			}

			provider = res.provider;
			accounts = await connect(provider);
			info = res.info ?? {};
		} else if (param.type === 'coinbase-wallet') {
			provider = this.coinbaseCore.provider;
			accounts = await connect(provider);
			info = COINBASE_INFO;
		} else {
			throw new Error(`Unsupported connect type: ${param.type}`);
		}

		return await this._completeConnection({
			provider,
			accounts,
			type: param.type,
			id: storageId,
			info,
			bindProviderEvents: true
		});
	}

	async disconnect() {
		if (this._disconnecting) return;

		this._disconnecting = true;
		const provider = this.provider;
		const isWalletConnect = provider && this.walletConnect.isProvider(provider);
		let disconnectError: any = null;

		this._unbindActiveProviderEvents();
		this.provider = null;
		this._setConnected(false);

		try {
			if (isWalletConnect) {
				await this.wcCore.destroyProvider(provider);
			} else if (provider?.disconnect) {
				await provider.disconnect();
			}
		} catch (err) {
			disconnectError = err;
		} finally {
			this._disconnecting = false;
		}

		this.emit('disconnect', disconnectError);
	}

	async autoConnect() {
		const lastConnect = lastUsedWallet();

		if (!lastConnect.type || !lastConnect.id || !lastConnect.connect) {
			return null;
		}

		let info: WalletInfo = {};
		let provider: WalletProvider | null = null;

		if (lastConnect.type === 'injected') {
			const res = await injectedConnector.searchWallet(lastConnect.id);
			if (!res?.provider) {
				this._setConnected(false);
				return null;
			}
			info = res.info ?? {};
			provider = res.provider;
		} else if (lastConnect.type === 'coinbase-wallet') {
			provider = this.coinbaseCore.provider;
			info = COINBASE_INFO;
		} else if (lastConnect.type === 'walletconnect' || lastConnect.type === 'wallet-connect') {
			const wcProvider = await this.wcCore.createProvider();
			if (!wcProvider.session) {
				this._setConnected(false);
				return null;
			}
			info = {
				icon: getStorageItem(`${PREFIX}-wc-connect-icon`) ?? WALLETCONNECT_INFO.icon,
				name: getStorageItem(`${PREFIX}-wc-connect-name`) ?? WALLETCONNECT_INFO.name
			};
			provider = wcProvider;
		} else {
			this._setConnected(false);
			return null;
		}

		if (!provider) {
			this._setConnected(false);
			return null;
		}

		let accounts: string[];
		try {
			accounts = await this._getAuthorizedAccounts(provider);
		} catch (err) {
			this._setConnected(false);
			return null;
		}

		if (!accounts.length) {
			this._setConnected(false);
			return null;
		}

		try {
			const walletChainId = await getChainId(provider);
			if (walletChainId !== this.currentChain.id) {
				this._setConnected(false);
				return null;
			}
		} catch (err) {
			this._setConnected(false);
			return null;
		}

		const standardData = await this._setConnectedProvider({
			provider,
			accounts,
			info,
			bindProviderEvents: lastConnect.type === 'injected' || lastConnect.type === 'coinbase-wallet'
		});

		this.emit('connect', standardData);
		return standardData;
	}

	async checkConnect() {
		const provider = this.provider;

		try {
			if (!provider) {
				throw new Error('Wallet is not connected');
			}
			if (typeof provider.request !== 'function') {
				throw new Error('Connected wallet does not expose a valid provider');
			}

			const accounts = await this._getAuthorizedAccounts(provider);
			if (!accounts.length) {
				throw new Error('Wallet is not authorized');
			}

			await this._detectConnect(provider);

			return await this._setConnectedProvider({
				provider,
				accounts,
				info: this._connectedInfo,
				bindProviderEvents: !this.walletConnect.isProvider(provider)
			});
		} catch (error) {
			await this.disconnect();
			throw error;
		}
	}

	getProvider() {
		return this.provider;
	}

	getState() {
		return {
			connected: Boolean(this.provider),
			accounts: this.accounts,
			chainId: this.currentChain.id,
			chains: this.chains,
			provider: this.provider
		};
	}

	updateConfig(config: any = {}) {
		const nextChains = config.chains
			? this._resolveChains(config.chains)
			: this.chains;
		const nextCurrentChain = config.currentChain
			? this._getValidChain(config.currentChain, 'Current chain is invalid')
			: this.currentChain;

		this._assertChainSupported(nextCurrentChain, nextChains);

		this.chains = nextChains;
		this.currentChain = nextCurrentChain;

		if (this.wcCore) {
			this.wcCore.parameter = {
				...this.wcCore.parameter,
				chains: [this.currentChain.id],
				optionalChains: this.chains.map(chain => chain.id),
				rpcMap: config.rpcMap ?? this.wcCore.parameter?.rpcMap ?? {}
			};
		}
	}

	/*
	|--------------------------------------------------------------------------
	| Internals
	|--------------------------------------------------------------------------
	*/

	private async _completeConnection({
		provider,
		accounts,
		type,
		id,
		info,
		bindProviderEvents,
		walletConnectIcon,
		walletConnectName
	}: {
		provider: WalletProvider;
		accounts: string[];
		type: ConnectType;
		id: string;
		info: WalletInfo;
		bindProviderEvents: boolean;
		walletConnectIcon?: string;
		walletConnectName?: string;
	}) {
		if (!accounts?.length) {
			throw new Error('Wallet did not return any accounts');
		}

		await this._detectConnect(provider);

		const standardData = await this._setConnectedProvider({
			provider,
			accounts,
			info,
			bindProviderEvents
		});

		this._saveConnection(type, id);

		if (walletConnectIcon !== undefined) {
			setStorageItem(`${PREFIX}-wc-connect-icon`, walletConnectIcon);
		}
		if (walletConnectName !== undefined) {
			setStorageItem(`${PREFIX}-wc-connect-name`, walletConnectName);
		}

		this.emit('connect', standardData);
		return standardData;
	}

	private async _setConnectedProvider({
		provider,
		accounts,
		info,
		bindProviderEvents
	}: {
		provider: WalletProvider;
		accounts: string[];
		info: WalletInfo;
		bindProviderEvents: boolean;
	}) {
		if (bindProviderEvents) {
			this._bindActiveProviderEvents(provider);
		} else {
			this._unbindActiveProviderEvents();
		}

		this.provider = provider;
		this.accounts = accounts;
		this._connectedInfo = info;
		this._setConnected(true);

		return {
			provider,
			accounts,
			info
		};
	}

	private async _detectConnect(provider: WalletProvider) {
		const walletChainId = await getChainId(provider);
		if (walletChainId === this.currentChain.id) return;

		try {
			await switchChain(provider, this.currentChain.id);
		} catch (err: any) {
			if (err?.code !== 4902) {
				throw err;
			}

			await addChain(provider, this.currentChain);
			await switchChain(provider, this.currentChain.id);
		}

		const currentChainId = await getChainId(provider);
		if (currentChainId !== this.currentChain.id) {
			throw new Error(`Failed to switch to chain ${this.currentChain.id}`);
		}
	}

	private _bindActiveProviderEvents(provider: WalletProvider) {
		if (!provider?.on) return;
		if (this._activeProvider === provider) return;

		this._unbindActiveProviderEvents();
		this._activeProvider = provider;

		this._activeProviderListeners = {
			accountsChanged: (accounts: string[]) => {
				this._handleAccountsChanged(accounts);
				this.emit('accountsChanged', accounts);
			},
			chainChanged: (chainId: string) => {
				this.emit('chainChanged', chainId);
			},
			disconnect: (error: any) => {
				this._handleProviderDisconnect(error);
			}
		};

		for (const [event, handler] of Object.entries(this._activeProviderListeners)) {
			provider.on(event, handler);
		}
	}

	private _unbindActiveProviderEvents() {
		if (!this._activeProvider) return;

		for (const [event, handler] of Object.entries(this._activeProviderListeners)) {
			this._removeListener(this._activeProvider, event, handler);
		}

		this._activeProvider = null;
		this._activeProviderListeners = {};
	}

	private _handleProviderDisconnect(error: any) {
		this._unbindActiveProviderEvents();
		this.provider = null;
		this.accounts = [];
		this._setConnected(false);
		if (!this._disconnecting) {
			this.emit('disconnect', error);
		}
	}

	private _handleAccountsChanged(accounts: string[]) {
		if (!Array.isArray(accounts)) return;

		this.accounts = accounts;

		if (accounts.length > 0) return;

		Promise.resolve()
			.then(() => this.disconnect())
			.catch(() => {});
	}

	private _removeListener(target: any, event: string, handler: EventCallback) {
		try {
			if (target.removeListener) {
				target.removeListener(event, handler);
			} else if (target.off) {
				target.off(event, handler);
			} else if (target.removeEventListener) {
				target.removeEventListener(event, handler);
			}
		} catch (err) {}
	}

	private async _getAuthorizedAccounts(provider: WalletProvider) {
		const accounts = await provider.request({
			method: 'eth_accounts'
		});

		if (!Array.isArray(accounts)) {
			return [];
		}

		return accounts;
	}

	private async _waitAuthorizedAccounts(
		provider: WalletProvider,
		timeout = 10000,
		interval = 200
	) {
		const start = Date.now();

		while (Date.now() - start < timeout) {
			try {
				const accounts = await this._getAuthorizedAccounts(provider);
				if (accounts.length) {
					return accounts;
				}
			} catch (err) {}

			await new Promise(resolve => setTimeout(resolve, interval));
		}

		return [];
	}

	private _saveConnection(type: ConnectType, id: string) {
		setStorageItem(`${PREFIX}-connect-type`, type);
		setStorageItem(`${PREFIX}-connect-id`, id);
		this._setConnected(true);
	}

	private _setConnected(connected: boolean) {
		if (!connected) {
			this.accounts = [];
			this._connectedInfo = {};
		}
		setStorageItem(`${PREFIX}-is-connect`, connected ? 'true' : 'false');
	}

	private _resolveChains(chainsConfig: any) {
		const list = Array.isArray(chainsConfig) && chainsConfig.length
			? chainsConfig
			: DEFAULT_CHAINS;

		const chains = list
			.map(GET_CHAINS)
			.filter(Boolean) as Chain[];
		const uniqueChains = Array.from(
			new Map(chains.map(chain => [chain.id, chain])).values()
		);

		if (!uniqueChains.length) {
			throw new Error('At least one valid chain is required');
		}

		return uniqueChains;
	}

	private _resolveCurrentChain(currentChainConfig: any) {
		const currentChain = this._getValidChain(
			currentChainConfig ?? this.chains[0],
			'Current chain is invalid'
		);

		this._assertChainSupported(currentChain, this.chains);

		return currentChain;
	}

	private _getValidChain(chainConfig: any, message: string) {
		const chain = GET_CHAINS(chainConfig);
		if (!chain) {
			throw new Error(message);
		}
		return chain;
	}

	private _assertChainSupported(currentChain: Chain, chains: Chain[]) {
		if (!chains.some(chain => chain.id === currentChain.id)) {
			throw new Error('Current chain must be included in supported chains');
		}
	}
}

export function createWallet(config: any) {
	return new WalletCore(config);
}
