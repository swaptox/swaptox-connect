import { sdkStore } from './store';

type StoreHost = {
	connectedCallback?(): void;
	disconnectedCallback?(): void;
	requestUpdate?(): void;
};

type Constructor<T = StoreHost> = new (...args: any[]) => T;

export const StoreMixin = <TBase extends Constructor>(superClass: TBase) => {
	return class StoreConnectedElement extends superClass {
		_onStateChange?: () => void;

		connectedCallback() {
			super.connectedCallback?.();
			this._onStateChange = () => {
				this.requestUpdate?.();
			};
			sdkStore.addEventListener('stxconnect-state-changed', this._onStateChange);
		}

		disconnectedCallback() {
			if (this._onStateChange) {
				sdkStore.removeEventListener('stxconnect-state-changed', this._onStateChange);
				this._onStateChange = undefined;
			}
			super.disconnectedCallback?.();
		}
	};
};
