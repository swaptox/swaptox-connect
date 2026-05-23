import {
	LitElement,
	html,
	css
} from 'lit';



export class StxconnectIconClose extends LitElement {
	static properties = {
		size: {
			type: String,
			reflect: true
		},
	};
	size = 'default';
	
	constructor() {
		super();
	}

	static get styles() {
		return css`
		:host {
			display: block;
		}
		
		.stxconnect-icon-close{
			width: 28px;
			min-width: 28px;
			height: 28px;
			border-radius: 9px;
			transition:
				box-shadow .3s cubic-bezier(.4, 0, .2, 1),
				border-color .3s cubic-bezier(.4, 0, .2, 1);
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--stxconnect-font-color, #111);
			fill: var(--stxconnect-font-color, #111);
			box-shadow: 0 0 0 1px var(--stxconnect-border-color, #ececec);
		}
		.stxconnect-icon-close[size=default]{
			border-radius: 9px;
			width: 28px;
			min-width: 28px;
			max-width: 28px;
			height: 28px;
			min-height: 28px;
			max-height: 28px;
		}
		
		
		
		
		.stxconnect-icon-close:hover {
			box-shadow: 0 0 0 2px var(--stxconnect-box-shadow-color, #02b6a680);
			background-color: #02b6a60d;
			color: #00a99a;
			fill: #00a99a;
		}
		
		
		
		.ui-icon-close-icon{
			fill: inherit;
			width: 11px;
			height: 11px;
		}
		.ui-icon-close-icon[size=default]{
			width: 11px;
			height: 11px;
		}
		
    `;
	}

	render() {
		return html`
		<div class="stxconnect-icon-close" @click=${this._tapIcon} size="${this.size}">
			<svg t="1770553993795" class="ui-icon-close-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12734"><path d="M605.23433 512.448271L1002.955803 114.355709c25.606159-25.725766 25.606159-67.144608 0-92.869353-25.612293-25.7319-67.144608-25.7319-92.755879 0L512.478451 419.572785 114.881696 21.486356c-25.612293-25.7319-67.144608-25.7319-92.756902 0-25.607182 25.725766-25.607182 67.143586 0 92.869353l397.602889 397.966821L22.124794 910.417138c-25.607182 25.7319-25.607182 67.144608 0 92.876508 12.742765 12.863394 29.530706 19.234266 46.437232 19.234266 16.787941 0 33.57486-6.370871 46.439277-19.234266l397.476125-397.967844L910.079295 1003.292624c12.743787 12.863394 29.650313 19.234266 46.438254 19.234265 16.781807 0 33.569748-6.370871 46.313536-19.234265 25.606159-25.7319 25.606159-67.144608 0-92.876509l-397.596755-397.967844z m0 0" p-id="12735"></path></svg>
		</div>
    `;
	}
	
	private _tapIcon() {
		this.dispatchEvent(new CustomEvent('close'));
	}
	
}


declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-icon-close' : StxconnectIconClose;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-icon-close')) {
	customElements.define('stxconnect-icon-close', StxconnectIconClose);
}
