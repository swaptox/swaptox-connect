export type BrowserType =
	| 'brave'
	| 'edge'
	| 'opera'
	| 'arc'
	| 'firefox'
	| 'safari'
	| 'chrome'
	| 'unknown';


function detectBraveSync() : boolean {
	try {
		if (typeof navigator === 'undefined') return false;
		const nav = navigator as any;
		// 1. 最简单快速判断
		if (nav?.brave?.isBrave) return true;
		// 2. UA 辅助（弱信号）
		const ua = navigator.userAgent;
		if (ua.includes('Brave')) return true;		
	} catch {}
	return false;
}


export function detectBrowser() : BrowserType {

	if (typeof navigator === 'undefined') {
		return 'unknown';
	}

	const ua = navigator.userAgent;

	if (!ua) return 'unknown';


	// --- Brave（最高优先级）
	if (detectBraveSync()) {
		return 'brave';
	}


	// --- Edge
	if (ua.includes('Edg/')) {
		return 'edge';
	}


	// --- Opera
	if (ua.includes('OPR/')) {
		return 'opera';
	}


	// --- Arc
	if (
		typeof window !== 'undefined' &&
		typeof document !== 'undefined'
	) {
		const arcFlag =
			getComputedStyle(document.body)
				.getPropertyValue('--arc-palette-focus');

		if (arcFlag) {
			return 'arc';
		}
	}


	// --- Firefox
	if (ua.includes('Firefox')) {
		return 'firefox';
	}


	// --- Safari
	const isSafari =
		/^((?!chrome|android|crios|fxios|edg|opr).)*safari/i.test(ua);

	if (isSafari) {
		return 'safari';
	}


	// --- Chrome / Chromium
	if (
		ua.includes('Chrome') ||
		ua.includes('Chromium')
	) {
		return 'chrome';
	}


	return 'unknown';
}
