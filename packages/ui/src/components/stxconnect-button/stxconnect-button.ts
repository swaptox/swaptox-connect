import {
	LitElement,
	html,
	css,
	nothing
} from 'lit';



export class StxconnectButton extends LitElement {

	static properties = {
		variant: { type: String, reflect: true },
		size: { type: String, reflect: true },

		plain: { type: Boolean, reflect: true },

		disabled: { type: Boolean, reflect: true },
		loading: { type: Boolean, reflect: true },

		full: { type: Boolean, reflect: true },
	};



	// primary | warn | default
	variant = 'primary';

	// mini | small | default
	size = 'default';



	plain = false;

	disabled = false;
	loading = false;

	full = false;



	static styles = css`

		:host {
			display: inline-block;
			vertical-align: middle;
		}



		:host([full]) {
			display: block;
			width: 100%;
		}



		.stxconnect-button {

			position: relative;

			width: 100%;
			height: 46px;

			padding: 0 18px;
			margin: 0;

			border: none;
			outline: none;

			border-radius: 999px;

			cursor: pointer;
			user-select: none;

			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 8px;

			font-size: 16px;
			font-weight: 500;

			font-family: var(--stxconnect-font-family);

			transition:
				background-color .2s ease,
				border-color .2s ease,
				color .2s ease,
				opacity .2s ease,
				transform .08s ease;

			box-sizing: border-box;

			-webkit-tap-highlight-color: transparent;
		}



		/* =========================
		   variants
		========================= */

		.stxconnect-button[data-variant="primary"] {

			background:
				var(--stxconnect-theme-color, #02b6a6);

			color:
				var(
					--stxconnect-button-primary-text-color,
					#fff
				);
		}



		.stxconnect-button[data-variant="warn"] {

			background: #ff5722;
			color: #fff;
		}



		.stxconnect-button[data-variant="default"] {

			background: #f3f3f3;
			color: #222;
		}



		/* =========================
		   plain mode
		========================= */

		.stxconnect-button[data-plain][data-variant="primary"] {

			background: transparent;

			color:
				var(--stxconnect-theme-color, #02b6a6);

			border:
				1px solid
				var(--stxconnect-theme-border-color, #02b6a6);
		}



		.stxconnect-button[data-plain][data-variant="warn"] {
			background: transparent;
			color: #ff5722;
			border: 1px solid var(--stxconnect-warn-border-color);
		}



		.stxconnect-button[data-plain][data-variant="default"] {

			background: transparent;

			color: #444;

			border: 1px solid #d9d9d9;
		}



		/* =========================
		   size
		========================= */

		.stxconnect-button[data-size="mini"] {

			height: 26px;

			padding: 0 10px;

			font-size: 12px;
		}



		.stxconnect-button[data-size="small"] {
			height: 30px;
			padding: 0 15px;
			font-size: 14px;
			line-height: 30px;
		}



		/* =========================
		   states
		========================= */

		.stxconnect-button:hover:not(:disabled) {

			opacity: .92;
		}



		.stxconnect-button:active:not(:disabled) {
			transform: scale(.96);
			opacity: .78;
		}



		.stxconnect-button:disabled {

			cursor: not-allowed;

			opacity: .5;
		}



		/* =========================
		   loading spinner
		========================= */

		.spinner {

			width: 14px;
			height: 14px;

			border-radius: 50%;

			border:
				2px solid
				currentColor;

			border-right-color: transparent;

			animation:
				stxconnect-button-spin
				.6s linear infinite;

			box-sizing: border-box;

			flex-shrink: 0;
		}



		@keyframes stxconnect-button-spin {

			to {
				transform: rotate(360deg);
			}
		}

	`;



	render() {

		return html`
			<button
				class="stxconnect-button"

				data-variant=${this.variant}
				data-size=${this.size}

				?data-plain=${this.plain}

				?disabled=${this.disabled || this.loading}

				@click=${this._onClick}
			>

				${this.loading
					? html`
						<span class="spinner"></span>
					`
					: nothing
				}

				<slot></slot>

			</button>
		`;
	}



	_onClick(e: MouseEvent) {

		if (this.disabled || this.loading) {
			return;
		}

		this.dispatchEvent(new CustomEvent('change', {
			detail: e,

			bubbles: true,
			composed: true
		}));
	}

}



declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-button': StxconnectButton;
	}
}



if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-button')) {

	customElements.define(
		'stxconnect-button',
		StxconnectButton
	);
}
