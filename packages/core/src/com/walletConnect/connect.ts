import { WALLETCONNECT_INFO } from '../../data/index';
import { createQrSvg } from '../../js_sdk/createQrSvg';

export type EventCallback = (data ?: any) => void;

export type WalletProvider = {
	request : (args : { method : string; params ?: any[] | Record<string, any> }) => Promise<any>;
	on ?: (event : string, callback : (...args : any[]) => void) => any;
	once ?: (event : string, callback : (...args : any[]) => void) => any;
	off ?: (event : string, callback : (...args : any[]) => void) => any;
	removeListener ?: (event : string, callback : (...args : any[]) => void) => any;
	disconnect ?: () => Promise<void>;
	connect ?: () => Promise<any>;
	enable ?: () => Promise<any>;
	session ?: any;
	accounts ?: string[];
	chainId ?: number | string;
	connected ?: boolean;
};

export type ConnectType = string;

export type WalletInfo = {
	id ?: string;
	name ?: string | null;
	icon ?: string | null;
	[key : string] : any;
};

export type ConnectResult = {
	provider : WalletProvider;
	accounts : string[];
	info : WalletInfo;
};

export type WalletConnectCallbacks = {
	display_uri ?: (uri : string, meta ?: { reused : boolean }) => any;
	connect ?: (result : ConnectResult) => any;
};

type WalletConnectWallet = WalletInfo & {
	type ?: ConnectType;
	id ?: string;
	image ?: string;
};

export type WalletConnectQrOptions = WalletConnectWallet & {
	change ?: (result : any) => any;
	connect ?: (result : ConnectResult) => any;
};

type CompleteConnectionInput = {
	provider : WalletProvider;
	accounts : string[];
	type : ConnectType;
	id : string;
	info : WalletInfo;
	bindProviderEvents : boolean;
	walletConnectIcon ?: string;
	walletConnectName ?: string;
};

type WalletConnectConnectionOptions = {
	wcCore : any;
	getCurrentProvider : () => WalletProvider | null;
	clearCurrentWalletConnectProvider : () => void;
	completeConnection : (input : CompleteConnectionInput) => Promise<ConnectResult>;
	waitAuthorizedAccounts : (provider : WalletProvider) => Promise<string[]>;
	emit : (event : string, data ?: any) => void;
	handleAccountsChanged : (accounts : string[]) => void;
	handleDisconnect : (error ?: any) => void;
};

const QR_REUSE_DELAY = 1000;
const QR_TTL = 2.5 * 60 * 1000;

function delay(ms : number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function callMaybeAsync<T extends any[]>(fn : ((...args : T) => any) | undefined, ...args : T) {
	if (typeof fn === 'function') {
		try {
			await fn(...args);
		} catch (error) { }
	}
}

export class WalletConnectConnection {
	private callbacks : WalletConnectCallbacks = {};
	private pendingProvider : WalletProvider | null = null;
	private pendingPromise : Promise<WalletProvider> | null = null;
	private pendingUri : string | null = null;
	private pendingUriAt = 0;
	private pendingWallet : WalletConnectWallet | null = null;
	private modalPendingProvider : WalletProvider | null = null;
	private modalPendingPromise : Promise<WalletProvider> | null = null;
	private coreEventsBound = false;

	constructor(private readonly options : WalletConnectConnectionOptions) {
		this.bindCoreEvents();
	}

	async providerModal() {
		if (this.hasPendingModal()) {
			return this.modalPendingPromise as Promise<WalletProvider>;
		}

		const activeProvider = this.options.getCurrentProvider();
		if (activeProvider && this.options.wcCore.isProvider?.(activeProvider) && activeProvider.session) {
			this.options.clearCurrentWalletConnectProvider();
			await this.options.wcCore.destroyProvider(activeProvider);
		}

		const existingModalProvider = this.options.wcCore.getProvider?.('modal');
		const wcProvider : WalletProvider = await this.options.wcCore.createProvider('dark', {
			reset: Boolean(existingModalProvider?.session)
		});

		this.modalPendingProvider = wcProvider;
		this.modalPendingPromise = this.connectModalProvider(wcProvider);
		return this.modalPendingPromise;
	}

	private async connectModalProvider(provider : WalletProvider) {
		try {
			const enabledAccounts = typeof provider.enable === 'function' ? await provider.enable() : [];
			const accounts = enabledAccounts?.length
				? enabledAccounts
				: await this.options.waitAuthorizedAccounts(provider);

			await this.options.completeConnection({
				provider,
				accounts,
				type: 'walletconnect',
				id: 'walletconnect',
				info: WALLETCONNECT_INFO,
				bindProviderEvents: false
			});

			this.clearPendingModal(provider);
			return provider;
		} catch (error) {
			this.clearPendingModal(provider);
			await this.options.wcCore.destroyProvider(provider);
			throw error;
		}
	}

	async provider(callbacks : WalletConnectCallbacks = {}, wallet : WalletConnectWallet = {}) {
		this.callbacks = callbacks ?? {};
		this.pendingWallet = wallet ?? {};

		if (this.hasPendingQr()) {
			if (!this.pendingUri) {
				return this.pendingPromise as Promise<WalletProvider>;
			}

			if (this.canReusePendingQr()) {
				await this.emitDisplayUri(this.pendingUri as string, true);
				return this.pendingPromise as Promise<WalletProvider>;
			}
		}

		const activeProvider = this.options.getCurrentProvider();
		if (activeProvider && this.options.wcCore.isProvider?.(activeProvider) && activeProvider.session) {
			this.options.clearCurrentWalletConnectProvider();
			await this.options.wcCore.destroyProvider(activeProvider);
		}

		const existingQrProvider = this.options.wcCore.getProvider?.('qr');
		const wcProvider : WalletProvider = await this.options.wcCore.createProvider(null, {
			reset: Boolean(existingQrProvider)
		});
		this.pendingProvider = wcProvider;
		this.pendingPromise = this.connectQrProvider(wcProvider);
		return this.pendingPromise;
	}

	async providerQr(options : WalletConnectQrOptions) {
		return this.provider(
			{
				display_uri: async (uri, meta) => {
					const svg = await createQrSvg({
						text: uri,
						image: options?.image ?? undefined,
						qrColor: options?.qrColor ?? undefined,
						bgColor: options?.bgColor ?? undefined
					});

					if (meta?.reused) {
						await delay(QR_REUSE_DELAY);
					}

					await callMaybeAsync(options?.change, {
						expirationTime: this.pendingUriAt+QR_TTL+QR_TTL,
						result: svg
					});
				},
				connect: options?.connect
			},
			options
		);
	}

	isProvider(provider : any) {
		return this.options.wcCore.isProvider?.(provider) ?? false;
	}

	private bindCoreEvents() {
		if (this.coreEventsBound) return;
		this.coreEventsBound = true;

		this.options.wcCore.on('display_uri', (uri : string) => {
			this.pendingUri = uri;
			this.pendingUriAt = Date.now();
			void this.emitDisplayUri(uri, false);
			this.options.emit('display_uri', uri);
		});

		this.options.wcCore.on('accountsChanged', (accounts : string[]) => {
			const nextAccounts = accounts || [];
			this.options.handleAccountsChanged(nextAccounts);
			this.options.emit('accountsChanged', nextAccounts);
		});

		this.options.wcCore.on('chainChanged', (chainId : any) => {
			this.options.emit('chainChanged', chainId);
		});

		this.options.wcCore.on('disconnect', (error : any) => {
			this.clearPending();
			this.clearPendingModal();
			this.options.handleDisconnect(error);
		});
	}

	private async connectQrProvider(provider : WalletProvider) {
		try {
			if (typeof provider.connect === 'function') {
				await provider.connect();
			}

			const accounts = await this.options.waitAuthorizedAccounts(provider);
			const wallet = this.pendingWallet ?? {};
			const icon = wallet.image ?? wallet.icon ?? WALLETCONNECT_INFO.icon;
			const name = wallet.name ?? WALLETCONNECT_INFO.name;

			const result = await this.options.completeConnection({
				provider,
				accounts,
				type: wallet.type || 'walletconnect',
				id: wallet.id || 'walletconnect',
				info: { icon, name },
				bindProviderEvents: false,
				walletConnectIcon: icon,
				walletConnectName: name
			});

			const connectCallback = this.callbacks.connect;
			this.clearPending(provider);
			await callMaybeAsync(connectCallback, result);
			return provider;
		} catch (error) {
			if (this.pendingProvider === provider) {
				this.clearPending(provider);
			}

			if (!provider.session) {
				await this.options.wcCore.destroyProvider(provider);
			}

			throw error;
		}
	}

	private canReusePendingQr() {
		if (!this.hasPendingQr() || !this.pendingUri) return false;
		return Date.now() - this.pendingUriAt < QR_TTL;
	}

	private hasPendingQr() {
		if (!this.pendingProvider || !this.pendingPromise) return false;
		return !this.pendingProvider.session;
	}

	private hasPendingModal() {
		if (!this.modalPendingProvider || !this.modalPendingPromise) return false;
		return !this.modalPendingProvider.session;
	}

	private async emitDisplayUri(uri : string, reused : boolean) {
		await callMaybeAsync(this.callbacks.display_uri, uri, { reused });
	}

	private clearPending(provider ?: WalletProvider) {
		if (provider && this.pendingProvider && this.pendingProvider !== provider) return;

		this.pendingProvider = null;
		this.pendingPromise = null;
		this.pendingUri = null;
		this.pendingUriAt = 0;
		this.pendingWallet = null;
		this.callbacks = {};
	}

	private clearPendingModal(provider ?: WalletProvider) {
		if (provider && this.modalPendingProvider && this.modalPendingProvider !== provider) return;

		this.modalPendingProvider = null;
		this.modalPendingPromise = null;
	}
}