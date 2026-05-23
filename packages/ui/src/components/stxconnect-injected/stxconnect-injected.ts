import { LitElement, html, css } from 'lit';

import '../stxconnect-logo/stxconnect-logo';
import '../stxconnect-copyright/stxconnect-copyright';
import { lastUsedWallet } from '@swaptox/connect-core';

import { sdkStore } from '../../store/store';
import { StoreMixin } from '../../store/state-mixin';

export class StxconnectInjected extends StoreMixin(LitElement) {
	
	static properties = {
		core: { attribute: false },
		localWallets: { type: Array },
		loadingId: { type: String },
	};
	
	core!: any;
	loadingId = '';
	lastConnectId:string|null = '';
	// Injected钱包列表
	localWallets:any[] = [];

	constructor() {
		super();
		const lastConnect = lastUsedWallet();
		this.lastConnectId = lastConnect?.type==='injected'?lastConnect.id:'';
	}
	

	static styles = css`
		:host {
			display: block;
			height: 100%;
		}
		.font-sans{
			font-family: var(--stxconnect-font-family);
			user-select: none;
			white-space: nowrap;
		}
		.header-title-body{
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
		}
		
		
		.stxconnect-injected-body{
			height: 100%;
			background-color: var(--stxconnect-content-bg);
			border-radius: 18px;
			overflow: hidden;
			box-shadow: 0 0 0 1px var(--stxconnect-border-color);
			overflow-y: auto;
			scrollbar-width: none;
			padding: 0 15px;
		}
		.stxconnect-injected-body::-webkit-scrollbar {
			display: none;
		}
		
		.injected-element{
			cursor: pointer;
			position: relative;
			padding: 4px 12px;display: flex;flex-direction: row;align-items: center;column-gap: 6px;
			border-radius: 16px;
			height: 52px;
			box-shadow: 0 0 0 1px var(--stxconnect-border-color);
			background-color: var(--stxconnect-theme-bg);
			border-radius: 18px;
			transition:
				box-shadow .2s cubic-bezier(.4, 0, .2, 1),
				background-color .2s cubic-bezier(.4, 0, .2, 1),
				transform .2s cubic-bezier(.4, 0, .2, 1);
		}
		.injected-element:hover {
			box-shadow: 0 0 0 1px rgba(2, 182, 166, .5);
			background-color: rgba(2, 182, 166, .1);
		}
		.injected-element:active{
			box-shadow: 0 0 0 1px rgba(2, 182, 166, .2);
			background-color: rgba(2, 182, 166, .06);
			transform: scale(0.96);
			transform-origin: center center;
		}
		
		.injected-el-loading{
			position: absolute;
			top: 0px;
			left: 0px;
			right: 0px;
			bottom: 0px;
			border-radius: 18px;
			background-color: #ffffff94;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		
		
		.item-alternation-height{
			height: 15px;
		}
		
		.stxc-theme-font-color{
			color: var(--stxconnect-font-color, #111);
		}
	`;



	// 点击选择钱包
	async selectWallet(id: string) {
		this.loadingId = id;
		try {
			const res = await this.core.connect({
				'type': 'injected',
				'id': id
			});
			this.dispatchEvent(
				new CustomEvent('connect', {
					detail: res,
					bubbles: false,
					composed: false,
				})
			);
			this.loadingId = '';
		} catch (err : any) {
			this.dispatchEvent(
				new CustomEvent('error', {
					detail: { source: 'injected', id, error: err },
					bubbles: true,
					composed: true,
				})
			);
			this.loadingId = '';
		}
	}




	renderLoading() {
		return html`
			<div class="injected-el-loading">
				<svg width="50px"  height="50px"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-ellipsis">
				    <circle cx="84" cy="50" r="0" fill="#c0f6d2">
						<animate attributeName="r" values="11;0;0;0;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
						<animate attributeName="cx" values="84;84;84;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
				    </circle>
				    <circle cx="40.0957" cy="50" r="11" fill="#ff7c81">
						<animate attributeName="r" values="0;11;11;11;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="-0.5s"></animate>
						<animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="-0.5s"></animate>
				    </circle>
				    <circle cx="16" cy="50" r="7.79567" fill="#fac090">
						<animate attributeName="r" values="0;11;11;11;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="-0.25s"></animate>
						<animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="-0.25s"></animate>
				    </circle>
				    <circle cx="84" cy="50" r="3.20433" fill="#ffffcb">
						<animate attributeName="r" values="0;11;11;11;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
						<animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
				    </circle>
				    <circle cx="74.0957" cy="50" r="11" fill="#c0f6d2">
						<animate attributeName="r" values="0;0;11;11;11" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
						<animate attributeName="cx" values="16;16;16;50;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
				    </circle>
				</svg>
			</div>
		`;
	}

	renderWalletItem(wallet: any, id: string) {
		const isLastConnect = this.lastConnectId === id;
		const isLoading = this.loadingId === id;
		const $t = sdkStore.$t;
		return html`
			<div class="injected-element" 
				style="pointer-events: ${isLoading?'none':'auto'};" 
				@click=${() => this.selectWallet(id)}
			>
				
				<stxconnect-logo 
					size="40px"
					radius="12px"
					src="${wallet.icon}"
					border="#ffffff00"
				></stxconnect-logo>
				
				<div>
					<div class="font-sans stxc-theme-font-color" style="font-size: 15px;line-height: 22px;"
					>${wallet.name}</div>
					<div class="font-sans" style="font-size: 11px;color: #169810;line-height: 16px;"
					>${$t['installed']}</div>
				</div>
				
				${isLastConnect ? html`
					<div style="position: absolute;top: 0;bottom: 0;right: 14px;display: flex;align-items: center;">
						<div class="font-sans" style="
							background-color: var(--stxconnect-last-used-bg);
							border-radius: 122px;
							padding: 0 8px;
							box-shadow: 0 0 0 1px #169810;
							color: #169810;
							font-size: 11px;
							white-space: nowrap;
							line-height: 20px;
						">${$t['last-used']}</div>
					</div>
				` : ``}
				
				${isLoading?this.renderLoading():``}
				
			</div>
			
			<div class="item-alternation-height"></div>
		`;
	}
	

	render() {
		return html`
			<div class="header-title-body">
				<span class="font-sans stxc-theme-font-color" style="font-size: 20px;line-height: 58px;"
				>Injected</span>
			</div>
			<div style="padding: 0 16px;height: calc(100% - 116px);">
				<div class="stxconnect-injected-body">
					<div class="item-alternation-height"></div>
					${this.localWallets.map(wallet => this.renderWalletItem(wallet.info, wallet.id))}
				</div>
			</div>
			<stxconnect-copyright></stxconnect-copyright>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-injected': StxconnectInjected;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-injected')) {
	customElements.define('stxconnect-injected', StxconnectInjected);
}
