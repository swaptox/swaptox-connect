type Eip6963Wallet = {
	provider: any;
	info: {
		uuid: string;
		name: string;
		icon: string;
		rdns?: string;
		[key: string]: any;
	};
	index: number;
	id: string;
	type: 'injected';
};

function hasBrowserWindow() {
	return typeof window !== 'undefined';
}

function normalizeWallet(detail: any): Eip6963Wallet | null {
	if (!detail?.provider || !detail?.info?.uuid) {
		return null;
	}

	return {
		...detail,
		index: 100,
		id: detail.info.rdns || detail.info.uuid,
		type: 'injected'
	};
}

function createLegacyWallet(): Eip6963Wallet | null {
	if (!hasBrowserWindow()) return null;

	const provider = (window as any).ethereum;
	if (!provider?.request) return null;

	const isMetaMask = Boolean(provider.isMetaMask);

	return {
		provider,
		info: {
			uuid: 'legacy-window-ethereum',
			name: isMetaMask ? 'MetaMask' : 'Injected Wallet',
			icon: '',
			rdns: isMetaMask ? 'io.metamask' : 'injected'
		},
		index: 100,
		id: isMetaMask ? 'io.metamask' : 'injected',
		type: 'injected'
	};
}

function matchesWallet(wallet: Eip6963Wallet, id: string) {
	return wallet.id === id || wallet.info.uuid === id || wallet.info.rdns === id;
}

export async function searchWalletEIP6963(id: string): Promise<Eip6963Wallet | null> {
	if (!hasBrowserWindow()) return null;

	return new Promise(resolve => {
		let settled = false;

		const finish = (wallet: Eip6963Wallet | null) => {
			if (settled) return;
			settled = true;
			window.removeEventListener('eip6963:announceProvider', onAnnouncement);
			window.clearTimeout(timer);
			resolve(wallet);
		};

		const onAnnouncement = (event: any) => {
			const wallet = normalizeWallet(event.detail);
			if (wallet && matchesWallet(wallet, id)) {
				finish(wallet);
			}
		};

		const timer = window.setTimeout(() => {
			const legacyWallet = createLegacyWallet();
			finish(legacyWallet && matchesWallet(legacyWallet, id) ? legacyWallet : null);
		}, 3000);

		window.addEventListener('eip6963:announceProvider', onAnnouncement);
		window.dispatchEvent(new CustomEvent('eip6963:requestProvider'));
	});
}

export async function detectWalletsEIP6963(timeoutMs: number = 150): Promise<Eip6963Wallet[]> {
	if (!hasBrowserWindow()) return [];

	const providers = new Map<string, Eip6963Wallet>();

	return new Promise(resolve => {
		const onAnnouncement = (event: any) => {
			const wallet = normalizeWallet(event.detail);
			if (wallet) {
				providers.set(wallet.info.uuid, wallet);
			}
		};

		window.addEventListener('eip6963:announceProvider', onAnnouncement);
		window.dispatchEvent(new CustomEvent('eip6963:requestProvider'));

		window.setTimeout(() => {
			window.removeEventListener('eip6963:announceProvider', onAnnouncement);

			if (!providers.size) {
				const legacyWallet = createLegacyWallet();
				if (legacyWallet) {
					providers.set(legacyWallet.info.uuid, legacyWallet);
				}
			}

			resolve(Array.from(providers.values()));
		}, Math.max(0, timeoutMs));
	});
}
