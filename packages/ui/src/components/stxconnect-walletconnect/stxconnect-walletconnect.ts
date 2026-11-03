import { LitElement, html, css, PropertyValues } from 'lit';

import '../stxconnect-logo/stxconnect-logo';
import '../stxconnect-connect-qr/stxconnect-connect-qr';
import '../stxconnect-button/stxconnect-button';
import './stxconnect-wallet-get';
import { sdkStore } from '../../store/store';
import { StoreMixin } from '../../store/state-mixin';
import { walletMap } from '../../data/walletList';
import { wcSdk } from '../../js_sdk/wcSdk';

function formatText(template = '', values: Record<string, string>) {
	return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}
export function getWalletConnectExpiry(uri: string): number | null {
    try {
        const query = uri.split('?')[1];
        if (!query) return null;

        const timestamp = new URLSearchParams(query).get('expiryTimestamp');
        if (!timestamp || !/^\d+$/.test(timestamp)) return null;

        const expiry = Number(timestamp);
        return Number.isSafeInteger(expiry) ? expiry : null;
    } catch {
        return null;
    }
}

export class StxconnectWalletconnect extends StoreMixin(LitElement) {
	static properties = {
		core: { attribute: false },
		loading: { type: Boolean },
		id: { type: String },
		type: { type: String },
		name: { type: String },
		image: { type: String },
		custom: { type: Boolean },
		getWallet: { type: Boolean },
		
		uri: { type: String },
		expirationTime: { type: Number },
	};

	core!: any;
	loading = true;
	id = '';
	type = '';
	name = '';
	image = '';
	custom = false;
	getWallet = false;
	
	uri = '';
	expirationTime = 0;
	
	private _requestId = 0;
	private _destroyed = false;

	connectedCallback() {
		super.connectedCallback();
		this._destroyed = false;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._destroyed = true;
		this._requestId++;
	}

	protected updated(changed: PropertyValues) {
		if (changed.has('id')&&changed.get('id')!==this.id) {
			this.getWallet = false;
		}
		const shouldRefresh = ['core', 'id', 'type', 'name', 'image'].some((prop) => changed.has(prop));
		if (shouldRefresh) {
			void this._providerUri(true);
		}
	}

	static styles = css`
		:host {
			display: block;
			height: 100%;
		}
		.font-sans {
			font-family: var(--stxconnect-font-family);
			user-select: none;
			white-space: nowrap;
		}
		.header-title-body {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
		}
		.subtitle-ellipsis {
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			white-space: normal;
		}
		.stxc-theme-font-color {
			color: var(--stxconnect-font-color, #111);
		}
		
		.connect-wallet-body {
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
	`;

	_connectSuccess(e: CustomEvent) {
		this.dispatchEvent(
			new CustomEvent('connect', {
				detail: e.detail,
				bubbles: false,
				composed: false,
			}),
		);
	}

	async _openAssistButton() {
		if (this.custom) {
			this.getWallet = true;
			return;
		}
		this.dispatchEvent(
			new CustomEvent('assist-button', {
				detail: { custom: this.custom },
				bubbles: false,
				composed: false,
			}),
		);
	}
	
	


	
	async _providerUri(isOpen: Boolean){
		if(this.custom&&wcSdk.isMobile()){
			
		}else{
			return;
		}
		if (!this.core || !this.id || !this.type) return;
		const requestId = ++this._requestId;
		
		try {
			await this.core.wcProvider({
				display_uri: (uri: string) => {
					if (this._destroyed || requestId !== this._requestId) return;
					this.uri = uri;
					this.expirationTime = getWalletConnectExpiry(uri)??Date.now()+(5 * 60 * 1000);
					this._startTimer();
					if(isOpen){
						this._connectApp();
					}
				},
				connect: (event: any) => {
					if (this._destroyed || requestId !== this._requestId) return;
					this.dispatchEvent(
						new CustomEvent('connect', {
							detail: event,
							bubbles: false,
							composed: false,
						}),
					);
				},
			}, {
				id: this.id,
				type: this.type,
				name: this.name,
				image: this.image,
			});
		} catch (error) {
			if (this._destroyed || requestId !== this._requestId) return;
			this.loading = false;
			this.dispatchEvent(
				new CustomEvent('error', {
					detail: { source: 'wcProviderQr', error },
					bubbles: true,
					composed: true,
				}),
			);
		}
	}
	private _startTimer() {
		const _timer = setInterval(() => {
			if (Date.now() >= this.expirationTime) {
				clearInterval(_timer);
				this._providerUri(false);
			}
		}, 1000);
	}
	
	
	
	
	
	_connectApp() {
		const walletId: string | undefined = typeof this?.id === 'string' ? this.id : undefined;
		const mobile = walletMap[walletId as keyof typeof walletMap]?.mobile;
		
		const native = mobile?.native;
		const universal = mobile?.universal;
		//console.log('打开链接', wcSdk.formatNativeUrl(native??universal, this.uri));
		const data = wcSdk.formatNativeUrl(native??universal, this.uri);
		if(data.redirect){
			//window.location.href = data.redirect;
			window.open(data.redirect);
		}else{
			//console.log('打开链接', data);
		}
	}


	_mobileRender(describeText: string){
		const $t = sdkStore.$t;
		const connectName = formatText(sdkStore.$t['connect-name'], { name: this.name });
		return html`
			<div class="header-title-body">
				<span class="font-sans stxc-theme-font-color" style="font-size: 18px; line-height: 58px;">
					${this.name}
				</span>
			</div>
			<div style="padding: 0 16px; height: calc(100% - 116px);">
				<div class="connect-wallet-body">
					<stxconnect-loading-spinner
						image=${this.image}
						?loading=${true}
						?iserror=${false}
					></stxconnect-loading-spinner>
			
					<span class="stxc-theme-font-color" style="font-family: var(--stxconnect-font-family);user-select: none;font-size: 18px; line-height: 50px;">
						${connectName}
					</span>
			
					<span style="font-family: var(--stxconnect-font-family);user-select: none;font-size: 14px; color: #999; line-height: 20px;">
						${$t['open-wallet-app']}
					</span>
			
					<div style="height: 20px;"></div>
			
					<div style="height: 32px;">
						<stxconnect-button ?disabled=${this.uri?false:true} @change=${this._connectApp} variant="default" size="small" ?plain=${true}>
							
							<svg t="1793004405034" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7133" width="14" height="14"><path d="M356.082517 82.438602c29.05217-0.716075 41.941513 7.569932 41.225438 37.849658-1.534446 71.09598 4.091855 71.812054-49.204555 71.505165h-22.914388c-50.943594 0.306889-101.887188-0.613778-152.830783 0.306889-43.475959 0.716075-54.012485 10.741119-54.012485 51.557373-0.204593 205.820304-0.409185 411.436015 0 617.256319 0 39.4864 7.979117 47.260925 49.102259 47.465518 213.185643 0.306889 426.26899 0.306889 639.352337 0 41.225439 0 53.194114-11.764083 53.705596-52.887226 0.716075-59.2296 1.432149-118.459201-0.102297-177.688801-0.716075-29.461356 10.536526-39.281808 40.509364-38.668029 81.325617 1.636742 72.323536-5.524004 72.630426 70.891387 0.409185 45.931072-3.068891 92.066736 0.818371 137.486326 8.797488 99.432075-60.354861 177.075023-182.394435 175.540578-149.352706-2.045927-298.705411-0.511482-448.262709-0.511482-55.649227 0-111.298455 0.818371-166.74309-0.409186C59.627626 1019.984867 0.602618 961.062156 0.398025 847.717774 0.091136 749.206366 0.091136 650.797254 0.091136 552.490439c0-100.659632-0.306889-201.319264 0.204593-301.978895C0.704914 141.668202 62.491924 82.950084 175.324824 82.745491c60.354861-0.102296 120.505128 1.022964 180.757693-0.306889zM962.80231 1.112985c30.688912 0.306889 59.127304 32.530247 59.434193 64.549011 1.022964 105.058376 1.022964 210.014455 0 315.072832-0.306889 34.883063-23.528166 54.830856-57.081377 54.626263-32.73484-0.204593-59.53649-23.016684-61.173231-56.774487-2.148224-45.726479-0.920667-91.657551-1.022964-137.38403l0.102296-36.417509c-19.129422 2.455113-25.471797 14.321492-33.860099 22.505202-96.056295 92.169033-191.907997 184.644955-287.350514 277.223173-20.254682 19.538607-41.839217 31.711876-71.300573 19.845496-35.803731-14.321492-47.67011-52.273447-25.062611-82.757766 7.365339-9.922748 16.878902-18.413347 25.880982-27.006243 91.452958-88.486363 183.315102-176.972727 274.665764-265.561386 8.797488-8.490599 20.152386-15.037567 24.755722-30.688912-39.281808-6.342375-78.15443-1.534446-116.822459-3.068891-26.597057-1.022964-53.398707 3.273484-79.484282-3.478077-29.768245-7.774524-45.214997-28.438392-43.271366-56.97908 2.25052-29.256763 18.208755-53.398707 51.352779-53.705596 113.446679-1.432149 226.893357-1.534446 340.23774 0z" p-id="7134" 
							fill="var(--stxconnect-button-plain-default-text)"></path></svg>
							
							${$t['open-app']}
						</stxconnect-button>
					</div>
					
					
					
					<div style="position: absolute;left: 0;right: 0;bottom: 0;padding: 0 16px; height: 58px; display: flex; flex-direction: row; align-items: center; justify-content: space-between;column-gap:10px;">
						<span class="font-sans subtitle-ellipsis" style="max-width: 300px; font-size: 14px; color: #999; flex: 1;">
							${describeText}
						</span>
						<stxconnect-button @change=${()=>(this.getWallet = true)} variant="primary" size="small" ?plain=${true}>
							${$t.get}
						</stxconnect-button>
					</div>
					
					${this.getWallet
						? html`
								<stxconnect-wallet-get
									id=${this.id}
									name=${this.name}
									@back=${() => (this.getWallet = false)}
								></stxconnect-wallet-get>
							`
						: null}
					
				</div>
			</div>
		`;
	}
	
	



	render() {
		const $t = sdkStore.$t;
		const describeText = formatText(
			this.custom ? $t['assist-get-wallet'] : $t['assist-official'],
			{ name: this.name },
		);
		const assistButton = this.custom ? $t.get : $t.open;
		
		
		
		if(this.custom&&wcSdk.isMobile()){
			return this._mobileRender(describeText);
		}
		
		
		

		return html`
			<div class="header-title-body">
				<span class="font-sans stxc-theme-font-color" style="font-size: 18px; line-height: 58px;">
					${this.name}
				</span>
			</div>
			<div style="padding: 0 16px; height: calc(100% - 116px);display: flex;align-items: center;justify-content: center;">
				<stxconnect-connect-qr
					.core=${this.core}
					id=${this.id}
					type=${this.type}
					name=${this.name}
					image=${this.image}
					@connect=${this._connectSuccess}
				></stxconnect-connect-qr>
			</div>
			<div style="padding: 0 16px; height: 58px; display: flex; flex-direction: row; align-items: center; justify-content: space-between;column-gap:10px;">
				<span class="font-sans subtitle-ellipsis" style="max-width: 300px; font-size: 14px; color: #999; flex: 1;">
					${describeText}
				</span>
				<stxconnect-button @change=${this._openAssistButton} variant="primary" size="small" ?plain=${true}>
					${assistButton}
				</stxconnect-button>
			</div>

			${this.getWallet
				? html`
						<stxconnect-wallet-get
							id=${this.id}
							name=${this.name}
							@back=${() => (this.getWallet = false)}
						></stxconnect-wallet-get>
					`
				: null}
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-walletconnect': StxconnectWalletconnect;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-walletconnect')) {
	customElements.define('stxconnect-walletconnect', StxconnectWalletconnect);
}
