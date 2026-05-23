import { EthereumProvider } from '@walletconnect/ethereum-provider';

type ProviderMode = 'qr' | 'modal';
type ListenerMap = Record<string, any>;

const MODAL_THEME = 'dark';

export class wcConnectorCore {
	parameter : any = null;
	provider : any = null;
	currentTheme : string | null = null;
	events : Record<string, Function[]> = {};

	private _providers : Record<ProviderMode, any> = {
		qr: null,
		modal: null
	};
	private _providerModes = new Map<any, ProviderMode>();
	private _listeners = new Map<any, ListenerMap>();

	constructor(config : any = {}) {
		this.parameter = config;
	}

	on(event : string, callback : Function) {
		if (!this.events[event]) this.events[event] = [];
		this.events[event].push(callback);
	}

	off(event : string, callback : Function) {
		if (!this.events[event]) return;
		this.events[event] = this.events[event].filter(fn => fn !== callback);
	}

	emit(event : string, data ?: any) {
		if (!this.events[event]) return;
		this.events[event].forEach(fn => fn(data));
	}

	async init({ showQrModal, themeMode } : any = {}) {
		return await EthereumProvider.init({
			projectId: this.parameter.projectId,
			// chains is deprecated; use optionalChains for multi-chain support.
			showQrModal,
			optionalChains: this.parameter.optionalChains,
			rpcMap: this.parameter.rpcMap,
			metadata: this.parameter.metadata,
			qrModalOptions: { themeMode }
		});
	}

	private _modeFromTheme(theme ?: string | null) : ProviderMode {
		return theme ? 'modal' : 'qr';
	}

	private _setActiveProvider(provider : any, mode : ProviderMode) {
		this.provider = provider;
		this.currentTheme = mode === 'modal' ? MODAL_THEME : null;
	}

	private _clearProvider(provider : any) {
		const mode = this._providerModes.get(provider);

		if (mode && this._providers[mode] === provider) {
			this._providers[mode] = null;
		}

		this._providerModes.delete(provider);
		this._listeners.delete(provider);

		if (this.provider === provider) {
			this.provider = null;
			this.currentTheme = null;
		}
	}

	private _addProviderListener(
		provider : any,
		event : string,
		listener : (...args : any[]) => any,
		once = false
	) {
		const events = this._listeners.get(provider) ?? {};
		events[event] = listener;
		this._listeners.set(provider, events);

		if (once && typeof provider.once === 'function') {
			provider.once(event, listener);
			return;
		}

		provider.on(event, listener);
	}

	private _destroyProviderEvents(provider : any) {
		const listeners = this._listeners.get(provider);
		if (!listeners) return;

		Object.entries(listeners).forEach(([event, listener]) => {
			provider.off?.(event, listener);
			provider.removeListener?.(event, listener);
		});

		this._listeners.delete(provider);
	}

	async destroyProvider(provider = this.provider) {
		if (!provider) return;

		this._destroyProviderEvents(provider);

		try {
			if (provider.session) {
				await provider.disconnect();
			}
		} catch (error) {
			// WalletConnect may reject if the session is already closed locally.
		}

		this._clearProvider(provider);
	}

	private _bindProviderEvents(provider : any) {
		if (this._listeners.has(provider)) return;

		this._addProviderListener(
			provider,
			'connect',
			async (data : any) => {
				const accounts = await this._waitAccounts(provider);
				this.emit('connect', { provider, accounts, chainId: provider.chainId, data });
			},
			true
		);

		this._addProviderListener(
			provider,
			'display_uri',
			(uri : string) => {
				this.emit('display_uri', uri);
			},
			true
		);

		this._addProviderListener(provider, 'accountsChanged', (accounts : string[]) => {
			this.emit('accountsChanged', accounts || []);
		});

		this._addProviderListener(provider, 'chainChanged', (chainId : any) => {
			this.emit('chainChanged', chainId);
		});

		this._addProviderListener(provider, 'disconnect', (error : any) => {
			this.emit('disconnect', error);
			this._destroyProviderEvents(provider);
			this._clearProvider(provider);
		});
	}

	async _waitAccounts(provider = this.provider, retry = 10, delay = 300) : Promise<string[]> {
		for (let i = 0; i < retry; i++) {
			try {
				const accounts = await provider.request({ method: 'eth_accounts' });
				if (accounts?.length) return accounts;
			} catch (error) { }
			await new Promise(resolve => setTimeout(resolve, delay));
		}
		return provider.accounts || [];
	}

	async createProvider(theme ?: string | null, options : { reset ?: boolean } = {}) {
		const mode = this._modeFromTheme(theme);
		const nextTheme = mode === 'modal' ? MODAL_THEME : null;
		const existingProvider = this._providers[mode];

		if (!options.reset && existingProvider) {
			this._setActiveProvider(existingProvider, mode);
			return existingProvider;
		}

		if (existingProvider) {
			await this.destroyProvider(existingProvider);
		}

		const provider = await this.init({
			showQrModal: mode === 'modal',
			themeMode: nextTheme ?? 'light'
		});

		this._providers[mode] = provider;
		this._providerModes.set(provider, mode);
		this._setActiveProvider(provider, mode);
		this._bindProviderEvents(provider);
		return provider;
	}

	async createModalProvider() {
		return this.createProvider(MODAL_THEME);
	}

	async createQrProvider(options : { reset ?: boolean } = {}) {
		return this.createProvider(null, options);
	}

	getProvider(mode ?: ProviderMode) {
		if (!mode) return this.provider;
		return this._providers[mode];
	}

	isProvider(provider : any) {
		if (!provider) return false;
		return this._providers.qr === provider || this._providers.modal === provider;
	}
}

export function wcConnector(config : any) {
	return new wcConnectorCore(config);
}