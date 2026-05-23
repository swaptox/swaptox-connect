class SDKStore extends EventTarget {
	$t: Record<string, string> = {};

	setLanguage(language: Record<string, string>) {
		this.$t = Object.assign({}, this.$t, language);
		if (typeof Event === 'undefined' && typeof CustomEvent === 'undefined') {
			return;
		}
		const event = typeof CustomEvent === 'undefined'
			? new Event('stxconnect-state-changed')
			: new CustomEvent('stxconnect-state-changed');
		this.dispatchEvent(event);
	}
}

export const sdkStore = new SDKStore();
