import { LitElement, html, css, nothing, PropertyValues } from 'lit';

export class StxconnectLogo extends LitElement {
	static properties = {
		size: { type: String },
		radius: { type: String },
		src: { type: String },
		name: { type: String },
		border: { type: String },
		loading: { type: Boolean, state: true },
		_error: { type: Boolean, state: true },
	};

	size = '20px';
	radius = '4px';
	src = '';
	name = '';
	border = '#eee';
	loading = false;
	private _error = false;
	private _hasRetried = false;
	private _retryTimer : number | undefined;

	disconnectedCallback() {
		super.disconnectedCallback();
		this._clearRetryTimer();
	}

	willUpdate(changed : PropertyValues) {
		if (changed.has('src')) {
			this._clearRetryTimer();
			this.loading = Boolean(this.src);
			this._error = false;
			this._hasRetried = false;
		}
	}

	static styles = css`
    :host {
      display: inline-block;
      flex: 0 0 auto;
      line-height: 0;
      vertical-align: middle;
    }
    .stxconnect-logo {
      position: relative;
      width: var(--logo-size, 20px);
      height: var(--logo-size, 20px);
      border-radius: var(--logo-radius, 4px);
      overflow: hidden;
	  /**/
      background: var(--stxconnect-theme-bg);
	  
	  
      box-sizing: border-box;
      color: #6b7280;
      user-select: none;
    }
    img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      border-radius: inherit;
      transition: opacity 0.18s ease;
      opacity: 1;
    }
    img.hidden-opacity {
      opacity: 0;
    }
    .placeholder,
    .fallback {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    .placeholder {
      background: #f7f8fa;
    }
    .placeholder::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.7) 41%, transparent 41%);
      background-size: 3px 3px;
    }
    .placeholder::after {
      content: "";
      position: absolute;
      inset: 0;
      background-image: linear-gradient(90deg, #ececec 25%, #f1f1f1 37%, #ececec 50%);
      background-size: 200% 100%;
      transform: scale(1.5) rotate(45deg);
      animation: shimmer 1s linear infinite;
    }
    @keyframes shimmer {
      0% { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
    .fallback {
      background:
        radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.9), transparent 34%),
        linear-gradient(135deg, #f3f4f6, #e5e7eb);
      font-size: max(10px, calc(var(--logo-size, 20px) * 0.38));
      font-weight: 700;
      letter-spacing: 0;
      line-height: 1;
      text-transform: uppercase;
    }
    @media (prefers-reduced-motion: reduce) {
      img {
        transition: none;
      }
      .placeholder::after {
        animation: none;
      }
    }
  `;

	render() {
		const hasImage = Boolean(this.src) && !this._error;

		return html`
      <div class="stxconnect-logo" style="
	  width: ${this.size}; 
	  height: ${this.size}; 
	  max-width: ${this.size}; 
	  max-height: ${this.size}; 
	  min-width: ${this.size};
	  border: 1px solid ${this.border};
	  --logo-size: ${this.size}; --logo-radius: ${this.radius};">
        ${hasImage ? html`
          <img 
            draggable="false" 
            loading="lazy"
            decoding="async"
            class="${this.loading ? 'hidden-opacity' : ''}" 
            src="${this.src}" 
            @load="${this._onload}" 
            @error="${this._onerror}">
        ` : ``}
        ${this.loading ? html`<div class="placeholder" aria-hidden="true"></div>` : nothing}
      </div>
    `;
	}

	_onload() {
		this.loading = false;
		this._error = false;
	}

	_onerror(e : Event) {
		const img = e.currentTarget as HTMLImageElement;

		if (this._hasRetried) {
			this.loading = false;
			this._error = true;
			return;
		}

		this._hasRetried = true;

		let currentUrl : URL;
		try {
			currentUrl = new URL(img.currentSrc || img.src, window.location.href);
		} catch {
			this.loading = false;
			this._error = true;
			return;
		}

		currentUrl.searchParams.set('t', 'retry');
		this._retryTimer = window.setTimeout(() => {
			img.src = currentUrl.toString();
		}, this._getRandomInt(100, 500));
	}


	private _getRandomInt(min : number, max : number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	private _clearRetryTimer() {
		if (this._retryTimer === undefined) return;
		window.clearTimeout(this._retryTimer);
		this._retryTimer = undefined;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-logo' : StxconnectLogo;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-logo')) {
	customElements.define('stxconnect-logo', StxconnectLogo);
}
