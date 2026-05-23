import './swaptox-connect';
import { createWallet } from '@swaptox/connect-core';

import type { SwaptoXConnect } from './swaptox-connect';
import { defaultTheme, themePack } from './data/themes';
import { currentLang, defaultLang, languagePack } from './data/locales';
import { deepMerge } from './js_sdk/deepMerge';
import { test } from './js_sdk/test';
import { sdkStore } from './store/store';

type EventCallback = (data?: any) => void;
type ThemeVariables = Record<string, string>;
type ThemePack = Record<string, ThemeVariables>;
type LanguagePack = Record<string, Record<string, string>>;

export interface ConnectUIOptions {
	theme?: string;
	themePack?: ThemePack;
	lang?: string;
	languagePack?: LanguagePack;
	container?: HTMLElement | string;
}

function assertBrowser(): Document {
	if (typeof document === 'undefined' || typeof customElements === 'undefined') {
		throw new Error('@swaptox/connect-ui requires a browser environment to render UI.');
	}
	return document;
}

function resolveContainer(target?: HTMLElement | string): HTMLElement {
	const doc = assertBrowser();

	if (target instanceof HTMLElement) {
		return target;
	}

	if (typeof target === 'string') {
		const el = doc.querySelector<HTMLElement>(target);
		if (!el) {
			throw new Error(`Container "${target}" was not found.`);
		}
		return el;
	}

	const container = doc.getElementById('swaptox-connect') as HTMLElement | null;
	if (!container) {
		throw new Error('Container target is required.');
	}
	return container;
}

function createDefaultContainer(): { container: HTMLElement; created: boolean } {
	const doc = assertBrowser();
	let container = doc.getElementById('swaptox-connect') as HTMLElement | null;
	if (container) {
		return { container, created: false };
	}

	container = doc.createElement('div');
	container.id = 'swaptox-connect';
	doc.body.appendChild(container);
	return { container, created: true };
}

function applyThemeVariables(container: HTMLElement, variables: ThemeVariables) {
	for (const [name, value] of Object.entries(variables)) {
		container.style.setProperty(name, value);
	}
}

function mergeTheme(defaults: ThemeVariables, override?: ThemeVariables): ThemeVariables {
	return Object.assign({}, defaults, override);
}

export function createConnect(config: any = {}, uidata: ConnectUIOptions = {}) {
	const core = createWallet(config);
	let stxEl: SwaptoXConnect | null = null;
	let container: HTMLElement | null = null;
	let ownsContainer = false;
	let allThemePack: ThemePack = themePack;
	let allLanguagePack: LanguagePack = languagePack;
	let activeTheme = uidata.theme && allThemePack[uidata.theme] ? uidata.theme : defaultTheme;

	function ensureContainer(): HTMLElement {
		if (!container) {
			if (uidata.container) {
				container = resolveContainer(uidata.container);
			} else {
				const resolved = createDefaultContainer();
				container = resolved.container;
				ownsContainer = resolved.created;
			}
		}
		return container;
	}

	function currentThemeVariables(theme = activeTheme): ThemeVariables {
		return mergeTheme(allThemePack[defaultTheme], allThemePack[theme]);
	}

	function applyTheme(theme = activeTheme) {
		activeTheme = theme;
		const host = ensureContainer();
		applyThemeVariables(host, currentThemeVariables(theme));
	}

	function initThemePack() {
		if (test.object(uidata.themePack)) {
			allThemePack = deepMerge(themePack, uidata.themePack);
		}
		activeTheme = uidata.theme && allThemePack[uidata.theme] ? uidata.theme : defaultTheme;
	}

	function initLanguage() {
		if (test.object(uidata.languagePack)) {
			allLanguagePack = deepMerge(languagePack, uidata.languagePack);
		}

		const mergedLanguage = Object.assign(
			{},
			allLanguagePack[defaultLang],
			allLanguagePack[currentLang],
			uidata.lang && allLanguagePack[uidata.lang] ? allLanguagePack[uidata.lang] : undefined,
		);
		sdkStore.setLanguage(mergedLanguage);
	}

	function initUI(): SwaptoXConnect {
		const host = ensureContainer();
		if (!stxEl || !stxEl.isConnected) {
			stxEl = host.querySelector('swaptox-connect') as SwaptoXConnect | null;
			if (!stxEl) {
				stxEl = document.createElement('swaptox-connect') as SwaptoXConnect;
				host.appendChild(stxEl);
			}
			stxEl.core = core;
			stxEl.addEventListener('connect', handleConnectSuccess, { once: true });
		}
		applyTheme(activeTheme);
		return stxEl;
	}

	function handleConnectSuccess() {
		stxEl?.remove();
		stxEl = null;
	}

	function open() {
		const el = initUI();
		void customElements.whenDefined('swaptox-connect').then(() => {
			if (stxEl === el && el.isConnected) {
				el.openModal();
			}
		});
	}

	async function autoConnect() {
		return core.autoConnect();
	}

	async function checkConnect() {
		return core.checkConnect();
	}

	async function disconnect() {
		return core.disconnect();
	}

	function close() {
		stxEl?.closeModal();
	}

	function destroy() {
		stxEl?.remove();
		stxEl = null;
		if (ownsContainer && container && container.childElementCount === 0) {
			container.remove();
		}
		container = null;
	}

	function updateConfig(next: any) {
		core.updateConfig(next);
	}

	function on(event: string, cb: EventCallback) {
		core.on(event, cb);
		return () => core.off(event, cb);
	}

	function off(event: string, cb: EventCallback) {
		core.off(event, cb);
	}

	function getProvider() {
		return core.getProvider();
	}

	function getState() {
		return core.getState();
	}

	function setTheme(theme: string) {
		if (!allThemePack[theme]) {
			return false;
		}
		applyTheme(theme);
		return true;
	}

	function setLang(lang: string) {
		if (!allLanguagePack[lang]) {
			return false;
		}
		sdkStore.setLanguage(Object.assign({}, allLanguagePack[defaultLang], allLanguagePack[lang]));
		return true;
	}

	initThemePack();
	initLanguage();

	return {
		open,
		autoConnect,
		checkConnect,
		disconnect,
		close,
		destroy,
		updateConfig,
		on,
		off,
		getProvider,
		getState,
		setTheme,
		setLang,
	};
}
