import { PREFIX } from '../data/index';

export function getBrowserStorage(): Storage | null {
	if (typeof window === 'undefined') return null;

	try {
		return window.localStorage;
	} catch (err) {
		return null;
	}
}

export function getStorageItem(key: string) {
	const storage = getBrowserStorage();
	if (!storage) return null;

	try {
		return storage.getItem(key);
	} catch (err) {
		return null;
	}
}

export function setStorageItem(key: string, value: string) {
	const storage = getBrowserStorage();
	if (!storage) return;

	try {
		storage.setItem(key, value);
	} catch (err) {}
}

export function lastUsedWallet() {
	return {
		type: getStorageItem(`${PREFIX}-connect-type`),
		id: getStorageItem(`${PREFIX}-connect-id`),
		connect: getStorageItem(`${PREFIX}-is-connect`) === 'true'
	};
}

