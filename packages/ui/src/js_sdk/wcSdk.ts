
export interface CaipNetwork {
	caipNetworkId: string;
	id: string;
	[key: string]: unknown;
}

export interface Balance {
	value?: number;
	[key: string]: unknown;
}

export type ChainNamespace = 'eip155' | 'solana' | 'bip122' | string;

export interface LinkingRecord {
	redirect: string;
	redirectUniversalLink?: string;
	href: string;
}

export const wcSdk = {
	getWindow(): Window | undefined {
		if (typeof window !== 'undefined') return window;
		return undefined;
	},

	isMobile(): boolean {
		if (!this.isClient()) return false;

		return !!(
			(window.matchMedia &&
				typeof window.matchMedia === 'function' &&
				window.matchMedia('(pointer:coarse)')?.matches) ||
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(
				navigator.userAgent
			)
		);
	},

	checkCaipNetwork(
		network: CaipNetwork | undefined,
		networkName = ''
	): boolean | undefined {
		return network?.caipNetworkId
			.toLocaleLowerCase()
			.includes(networkName.toLowerCase());
	},

	isAndroid(): boolean {
		if (!this.isMobile()) return false;

		return window.navigator.userAgent.toLowerCase().includes('android');
	},

	isIos(): boolean {
		if (!this.isMobile()) return false;

		const userAgent = window.navigator.userAgent.toLowerCase();

		return (
			userAgent.includes('iphone') ||
			userAgent.includes('ipad') ||
			userAgent.includes('ipod')
		);
	},

	isSafari(): boolean {
		if (!this.isClient()) return false;

		const userAgent = window.navigator.userAgent.toLowerCase();

		return (
			userAgent.includes('safari') &&
			!userAgent.includes('chrome') &&
			!userAgent.includes('crios') &&
			!userAgent.includes('chromium') &&
			!userAgent.includes('android')
		);
	},

	isClient(): boolean {
		return typeof window !== 'undefined';
	},

	isIframe(): boolean {
		try {
			return window.self !== window.top;
		} catch {
			return false;
		}
	},

	isSafeApp(): boolean {
		if (this.isClient() && window.self !== window.top) {
			try {
				const ancestorOrigin = window.location.ancestorOrigins?.[0];

				if (ancestorOrigin) {
					return (
						new URL(ancestorOrigin).hostname ===
						'app.safe.global'
					);
				}
			} catch {
				return false;
			}
		}

		return false;
	},

	isHttpUrl(url: string): boolean {
		return /^https?:\/\//i.test(url);
	},

	formatNativeUrl(
		appUrl: string,
		wcUri: string,
		universalLink: string | null = null
	): LinkingRecord {
		if (this.isHttpUrl(appUrl)) {
			return this.formatUniversalUrl(appUrl, wcUri);
		}

		let nativeUrl = appUrl;
		let universalUrl = universalLink;

		if (!nativeUrl.includes('://')) {
			//nativeUrl = nativeUrl.replaceAll('/', '').replaceAll(':', '');
			nativeUrl = nativeUrl.replace(/[/:]/g, '');
			nativeUrl = `${nativeUrl}://`;
		}

		if (!nativeUrl.endsWith('/')) {
			nativeUrl += '/';
		}

		if (universalUrl && !universalUrl.endsWith('/')) {
			universalUrl += '/';
		}

		let uri = wcUri;

		if (this.isTelegram() && this.isAndroid()) {
			uri = encodeURIComponent(uri);
		}

		const encodedUri = encodeURIComponent(uri);

		return {
			redirect: `${nativeUrl}wc?uri=${encodedUri}`,
			redirectUniversalLink: universalUrl
				? `${universalUrl}wc?uri=${encodedUri}`
				: undefined,
			href: nativeUrl
		};
	},

	formatUniversalUrl(
		appUrl: string,
		wcUri: string
	): LinkingRecord {
		if (!this.isHttpUrl(appUrl)) {
			return this.formatNativeUrl(appUrl, wcUri);
		}

		let url = appUrl;

		if (!url.endsWith('/')) {
			url += '/';
		}

		return {
			redirect: `${url}wc?uri=${encodeURIComponent(wcUri)}`,
			href: url
		};
	},

	isTelegram(): boolean {
		if (typeof window === 'undefined') return false;

		const telegramWindow = window as Window & {
			TelegramWebviewProxy?: unknown;
			Telegram?: unknown;
			TelegramWebviewProxyProto?: unknown;
		};

		return !!(
			telegramWindow.TelegramWebviewProxy ||
			telegramWindow.Telegram ||
			telegramWindow.TelegramWebviewProxyProto
		);
	},

	isPWA(): boolean {
		if (typeof window === 'undefined') return false;

		const standalone =
			!!window.matchMedia?.('(display-mode: standalone)').matches ||
			!!(window.navigator as Navigator & { standalone?: boolean })
				.standalone;

		return standalone;
	},

	getUUID(): string {
		if (typeof crypto !== 'undefined' && crypto.randomUUID) {
			return crypto.randomUUID();
		}

		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
			/[xy]/gu,
			(char: string) => {
				const random = (Math.random() * 16) | 0;
				const value = char === 'x' ? random : (random & 3) | 8;

				return value.toString(16);
			}
		);
	},

	parseError(error: unknown): string {
		if (typeof error === 'string') return error;

		if (
			typeof error === 'object' &&
			error !== null &&
			'issues' in error &&
			Array.isArray(error.issues) &&
			typeof error.issues[0]?.message === 'string'
		) {
			return error.issues[0].message;
		}

		return error instanceof Error ? error.message : 'Unknown error';
	},

	sortRequestedNetworks(
		approvedIds: `${string}:${string}`[] | undefined,
		requestedNetworks: CaipNetwork[] = []
	): CaipNetwork[] {
		if (!approvedIds || !requestedNetworks.length) {
			return requestedNetworks;
		}

		const order: Record<string, number> = {};

		approvedIds.forEach((id, index) => {
			order[id] = index;
		});

		return requestedNetworks.sort((a, b) => {
			const indexA = order[a.id];
			const indexB = order[b.id];

			if (indexA !== undefined && indexB !== undefined) {
				return indexA - indexB;
			}

			if (indexA !== undefined) return -1;
			if (indexB !== undefined) return 1;

			return 0;
		});
	},

	calculateBalance(array: Balance[]): number {
		let total = 0;

		for (const item of array) {
			total += item.value ?? 0;
		}

		return total;
	},

	formatTokenBalance(
		value: number
	): {
		dollars: string | undefined;
		pennies: string | undefined;
	} {
		const [dollars, pennies] = value.toFixed(2).split('.');

		return { dollars, pennies };
	},

	isAddress(
		address: string,
		chain: ChainNamespace = 'eip155'
	): boolean {
		switch (chain) {
			case 'eip155':
				return /^(?:0x)?[0-9a-f]{40}$/iu.test(address);

			case 'solana':
				return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/u.test(address);

			case 'bip122':
				return (
					/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/u.test(address) ||
					/^bc1[a-z0-9]{39,87}$/u.test(address)
				);

			default:
				return false;
		}
	},

	isMac(): boolean {
		if (typeof window === 'undefined') return false;

		const userAgent = window.navigator.userAgent.toLowerCase();

		return (
			userAgent.includes('macintosh') &&
			!userAgent.includes('safari')
		);
	},

	isNumber(value: unknown): boolean {
		return (
			(typeof value === 'number' || typeof value === 'string') &&
			!Number.isNaN(Number(value))
		);
	}
};


/*
export const wcSdk2 = {
	getWindow() {
		if (!(typeof window > "u")) return window
	},
	isMobile() {
		return wcSdk.isClient() ? !!(window?.matchMedia && typeof window.matchMedia == "function" && window
			.matchMedia("(pointer:coarse)")?.matches ||
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent)) : !1
	},
	checkCaipNetwork(t, e = "") {
		return t?.caipNetworkId.toLocaleLowerCase().includes(e.toLowerCase())
	},
	isAndroid() {
		if (!wcSdk.isMobile()) return !1;
		const t = window?.navigator.userAgent.toLowerCase();
		return wcSdk.isMobile() && t.includes("android")
	},
	isIos() {
		if (!wcSdk.isMobile()) return !1;
		const t = window?.navigator.userAgent.toLowerCase();
		return t.includes("iphone") || t.includes("ipad")
	},
	isSafari() {
		return wcSdk.isClient() ? (window?.navigator.userAgent.toLowerCase()).includes("safari") : !1
	},
	isClient() {
		return typeof window < "u"
	},
	isIframe() {
		try {
			return window?.self !== window?.top
		} catch {
			return !1
		}
	},
	isSafeApp() {
		if (wcSdk.isClient() && window.self !== window.top) try {
			const t = window?.location?.ancestorOrigins?.[0],
				e = "https://app.safe.global";
			if (t) {
				const r = new URL(t),
					n = new URL(e);
				return r.hostname === n.hostname
			}
		} catch {
			return !1
		}
		return !1
	},
	isHttpUrl(t) {
		return t.startsWith("http://") || t.startsWith("https://")
	},
	formatNativeUrl(t, e, r = null) {
		if (wcSdk.isHttpUrl(t))
			return wcSdk.formatUniversalUrl(t, e);
		let n = t,
			s = r;
		n.includes("://") || (n = t.replaceAll("/", "").replaceAll(":", ""), n = `${n}://`), n.endsWith(
			"/") || (n = `${n}/`), s && !s?.endsWith("/") && (s = `${s}/`), wcSdk.isTelegram() && wcSdk
				.isAndroid() && (e = encodeURIComponent(e));
		const i = encodeURIComponent(e);
		return {
			redirect: `${n}wc?uri=${i}`,
			redirectUniversalLink: s ? `${s}wc?uri=${i}` : void 0,
			href: n
		}
	},
	formatUniversalUrl(t, e) {
		if (!wcSdk.isHttpUrl(t)) return wcSdk.formatNativeUrl(t, e);
		let r = t;
		r.endsWith("/") || (r = `${r}/`);
		const n = encodeURIComponent(e);
		return {
			redirect: `${r}wc?uri=${n}`,
			href: r
		}
	},
	isTelegram() {
		return typeof window < "u" && (!!window.TelegramWebviewProxy || !!window.Telegram || !!window
			.TelegramWebviewProxyProto)
	},
	isPWA() {
		if (typeof window > "u") return !1;
		const t = window?.matchMedia && typeof window.matchMedia == "function" ? window.matchMedia(
			"(display-mode: standalone)")?.matches : !1,
			e = window?.navigator?.standalone;
		return !!(t || e)
	},
	getUUID() {
		return crypto?.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
			/[xy]/gu, t => {
				const e = Math.random() * 16 | 0;
				return (t === "x" ? e : e & 3 | 8).toString(16)
			})
	},
	parseError(t) {
		return typeof t == "string" ? t : typeof t?.issues?.[0]?.message == "string" ? t.issues[0].message :
			t instanceof Error ? t.message : "Unknown error"
	},
	sortRequestedNetworks(t, e = []) {
		const r = {};
		return e && t && (t.forEach((n, s) => {
			r[n] = s
		}), e.sort((n, s) => {
			const i = r[n.id],
				o = r[s.id];
			return i !== void 0 && o !== void 0 ? i - o : i !== void 0 ? -1 : o !== void 0 ? 1 :
				0
		})), e
	},
	calculateBalance(t) {
		let e = 0;
		for (const r of t) e += r.value ?? 0;
		return e
	},
	formatTokenBalance(t) {
		const e = t.toFixed(2),
			[r, n] = e.split(".");
		return {
			dollars: r,
			pennies: n
		}
	},
	isAddress(t, e = "eip155") {
		switch (e) {
			case "eip155":
				if (/^(?:0x)?[0-9a-f]{40}$/iu.test(t)) {
					if (/^(?:0x)?[0-9a-f]{40}$/iu.test(t) || /^(?:0x)?[0-9A-F]{40}$/iu.test(t)) return !0
				} else return !1;
				return !1;
			case "solana":
				return /[1-9A-HJ-NP-Za-km-z]{32,44}$/iu.test(t);
			case "bip122": {
				const r = /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/u.test(t),
					n = /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/u.test(t),
					s = /^bc1[a-z0-9]{39,87}$/u.test(t),
					i = /^bc1p[a-z0-9]{58}$/u.test(t);
				return r || n || s || i
			}
			default:
				return !1
		}
	},
	isMac() {
		const t = window?.navigator.userAgent.toLowerCase();
		return t.includes("macintosh") && !t.includes("safari")
	},
	isNumber(t) {
		return typeof t != "number" && typeof t != "string" ? !1 : !isNaN(Number(t))
	}
};

*/






