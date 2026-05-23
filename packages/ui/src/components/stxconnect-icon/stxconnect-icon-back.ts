import {
	LitElement,
	html,
	css
} from 'lit';



export class StxconnectIconBack extends LitElement {
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
		
		.stxconnect-icon-back{
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
			box-shadow: 0 0 0 1px #ffffff00;
		}
		.stxconnect-icon-back[size=default]{
			border-radius: 9px;
			width: 28px;
			min-width: 28px;
			max-width: 28px;
			height: 28px;
			min-height: 28px;
			max-height: 28px;
		}
		
		.stxconnect-icon-back:hover {
			box-shadow: 0 0 0 2px var(--stxconnect-box-shadow-color, #02b6a680);
			background-color: #02b6a60d;
			color: #00a99a;
		}
		
    `;
	}

	render() {
		return html`
		<div class="stxconnect-icon-back" @click=${this._tapIcon} size="${this.size}">
			<svg t="1779432183745" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5902" width="16" height="16"><path d="M710.33173334 885.4016a51.2 51.2 0 0 1-72.3968 72.3968l-409.6-409.6a51.2 51.2 0 0 1 0-72.3968l409.6-409.6a51.2 51.2 0 0 1 72.3968 72.3968L336.93013334 512l373.4016 373.4016z" fill="var(--stxconnect-font-color, #111)" p-id="5903"></path></svg>
		</div>
    `;
	}
	
	private _tapIcon() {
		this.dispatchEvent(new CustomEvent('back'));
	}
	
}


declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-icon-back': StxconnectIconBack;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-icon-back')) {
	customElements.define('stxconnect-icon-back', StxconnectIconBack);
}
