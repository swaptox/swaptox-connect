import { LitElement, html, css, PropertyValues } from 'lit';

import '../stxconnect-button/stxconnect-button';
import { sdkStore } from '../../store/store';
import { StoreMixin } from '../../store/state-mixin';

export class StxconnectExpiredMask extends StoreMixin(LitElement) {
	static properties = {
		expiredTime: { type: Number },
		isExpired: { type: Boolean },
	};

	expiredTime = 0;
	isExpired = false;
	private _timer?: any;

	connectedCallback() {
		super.connectedCallback();
		this._startTimer();
	}

	disconnectedCallback() {
		this._clearTimer();
		super.disconnectedCallback();
	}

	protected updated(changed: PropertyValues) {
		if (changed.has('expiredTime')) {
			this._startTimer();
		}
	}

	private _startTimer() {
		this._clearTimer();
		this.isExpired = false;
		if (!this.expiredTime) return;
		this._timer = setInterval(() => {
			if (Date.now() >= this.expiredTime) {
				this.isExpired = true;
				this._clearTimer();
			}
		}, 1000);
	}

	private _clearTimer() {
		if (this._timer) {
			clearInterval(this._timer);
			this._timer = undefined;
		}
	}

	static styles = css`
		:host {
			display: block;
		}
		.stxconnect-mask-absolute {
			position: absolute;
			inset: 0;
			z-index: 4;
		}
		.stxconnect-expired-mask {
			background-color: var(--stxconnect-qr-expired-mask);
			border-radius: 18px;
			backdrop-filter: blur(4px) saturate(0);
		}
		.stxconnect-expired-flex {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
		.font-sans {
			font-family: var(--stxconnect-font-family);
			user-select: none;
			white-space: nowrap;
		}
		.stxc-theme-font-color {
			color: var(--stxconnect-font-color, #111);
		}
	`;

	_refresh() {
		this.dispatchEvent(
			new CustomEvent('refresh', {
				bubbles: false,
				composed: false,
			}),
		);
		this.isExpired = false;
	}

	render() {
		if (!this.isExpired) {
			return null;
		}

		return html`
			<div class="stxconnect-mask-absolute">
				<div class="stxconnect-mask-absolute stxconnect-expired-mask"></div>
				<div class="stxconnect-mask-absolute stxconnect-expired-flex" style="z-index: 5; row-gap: 10px;">
					<svg viewBox="0 0 1098 1024" xmlns="http://www.w3.org/2000/svg" width="40" height="40" aria-hidden="true">
						<path
							d="M610.892409 345.817428C611.128433 343.63044 611.249529 341.409006 611.249529 339.159289 611.249529 305.277109 583.782594 277.810176 549.900416 277.810176 516.018238 277.810176 488.551303 305.277109 488.551303 339.159289 488.551303 339.229063 488.55142 339.298811 488.551654 339.368531L488.36115 339.368531 502.186723 631.80002C502.185201 631.957072 502.184441 632.114304 502.184441 632.271715 502.184441 658.624519 523.547611 679.98769 549.900416 679.98769 576.253221 679.98769 597.616391 658.624519 597.616391 632.271715 597.616391 631.837323 597.610587 631.404284 597.599053 630.972676L610.892409 345.817428ZM399.853166 140.941497C481.4487 1.632048 613.916208 1.930844 695.336733 140.941497L1060.013239 763.559921C1141.608773 902.869372 1076.938039 1015.801995 915.142835 1015.801995L180.047065 1015.801995C18.441814 1015.801995-46.243866 902.570576 35.176659 763.559921L399.853166 140.941497ZM549.900416 877.668165C583.782594 877.668165 611.249529 850.201231 611.249529 816.319053 611.249529 782.436871 583.782594 754.96994 549.900416 754.96994 516.018238 754.96994 488.551303 782.436871 488.551303 816.319053 488.551303 850.201231 516.018238 877.668165 549.900416 877.668165Z"
							fill="#FB6547"
						></path>
					</svg>

					<span class="font-sans stxc-theme-font-color" style="font-size: 16px;">
						${sdkStore.$t['qr-expired']}
					</span>

					<stxconnect-button @change=${this._refresh} variant="warn" size="small">
						${sdkStore.$t.refresh}
					</stxconnect-button>
				</div>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-expired-mask': StxconnectExpiredMask;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-expired-mask')) {
	customElements.define('stxconnect-expired-mask', StxconnectExpiredMask);
}
