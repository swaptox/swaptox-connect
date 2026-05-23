import { LitElement, html, css, PropertyValues } from 'lit';

export class StxconnectModal extends LitElement {
	
	static properties = {
		open: { type: Boolean, reflect: true }
	};
	open = false;
	
	
	

	private _dialog!: HTMLDialogElement;

	static styles = css`
		:host {
			display: none;
			margin: 0;
			padding: 0;
		}
		:host([open]) {
			display: block;
		}
		
		dialog {
			border: none;
			padding: 0;
			border-radius: 20px;
			position: fixed;
			z-index: 100;
			width: 700px;
			max-width: 100vw;
			margin: auto;
			inset: 0;
			box-sizing: border-box;
			outline: none;
			background-color: var(--stxconnect-theme-bg, #fff);
			overflow: hidden;
		}
		
		@keyframes bounceIn__modal123 {
			0% { transform: translate3d(0,-20px,0); opacity: 0 }
			to { transform: translateZ(0); opacity: 1 }
		}
		
		dialog[open] {
			animation: bounceIn__modal123 0.25s ease;
		}
		
		@keyframes bounceIn__modal132 {
			0% { transform: translate3d(0,100px,0); opacity: 0 }
			to { transform: translateZ(0); opacity: 1 }
		}
		
		@media (max-width: 700px) {
			dialog {
				width: 100vw;
				max-width: 100vw;
				margin: auto auto 0 auto;
				inset: auto 0 0 0;
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
			}
			dialog[open] {
				animation: bounceIn__modal132 0.25s ease;
			}
		}
		
		@media (max-height: 500px) {
			dialog {
				margin: 0;
				inset: 0;
				border-radius: 0;
				height: 100vh;
				max-height: 100vh;
			}
		}
		
		@keyframes backdrop-fade-in {
			from {
				opacity: 0;
				backdrop-filter: blur(0px) saturate(0);
				background-color: transparent;
			}
			to {
				opacity: 1;
				backdrop-filter: blur(12px) saturate(1.5);
				background-color: rgba(0, 0, 0, .12);
			}
		}
		
		dialog[open]::backdrop {
			animation: backdrop-fade-in 0.2s ease-out forwards;
		}
	`;

	constructor() {
		super();
		this._ensureGlobalStyles();
	}

	protected firstUpdated() {
		this._dialog = this.shadowRoot!.querySelector('dialog')!;
	}

	protected updated(changed: PropertyValues) {
		if (changed.has('open')) {
			if (this.open) {
				if (!this._dialog.open) {
					this._dialog.showModal();
				}
				this._lockScroll();
			} else {
				if (this._dialog.open) {
					this._dialog.close();
				}
				this._unlockScroll();
			}
		}
	}

	private _ensureGlobalStyles() {
		if (typeof document === 'undefined') return;
		const styleId = 'app-stx-modal-global-styles';
		if (!document.getElementById(styleId)) {
			const style = document.createElement('style');
			style.id = styleId;
			style.textContent = `
				html.app-stx-scroll-locked,
				body.app-stx-scroll-locked {
					touch-action: none !important;
					overflow: hidden !important;
					overscroll-behavior: contain !important;
				}
			`;
			document.head.appendChild(style);
		}
	}

	private _lockScroll() {
		if (typeof document === 'undefined') return;
		document.body.classList.add('app-stx-scroll-locked');
		document.documentElement.classList.add('app-stx-scroll-locked');
	}

	private _unlockScroll() {
		if (typeof document === 'undefined') return;
		document.body.classList.remove('app-stx-scroll-locked');
		document.documentElement.classList.remove('app-stx-scroll-locked');
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._unlockScroll();
	}

	private _handleClick(e: MouseEvent) {
		if (e.target === this._dialog) {
			this.dispatchEvent(new CustomEvent('mask'));
		}
	}

	render() {
		return html`
			<dialog @click=${this._handleClick} tabindex="-1">
				<slot></slot>
			</dialog>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-modal': StxconnectModal;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-modal')) {
	customElements.define('stxconnect-modal', StxconnectModal);
}
