import { LitElement, html, css } from 'lit';


export class StxconnectLoadingSpinner extends LitElement {
	
	static properties = {
		loading: { type: Boolean },
		iserror: { type: Boolean },
		image: { type: String },
	};
	
	loading = false;
	iserror = false;
	image = '';

	static styles = css`
		:host {
			display: block;
		}
		
		.icon-with-spinner__animation {
		    animation: spin 1.4s linear infinite;
		}
		.icon-with-spinner__spinner-container {
			position: absolute;
		    display: grid;
		    grid-template-columns: repeat(2, minmax(0, 1fr));
		    grid-template-rows: repeat(2, minmax(0, 1fr));
		    top: 0;
		    right: 0;
		}
		@keyframes spin {
			0% {
			    transform: rotate(0);
			}
			100% {
			    transform: rotate(360deg);
			}
		}
		.icon-with-spinner__spinner {
		    grid-column-start: 2;
		    grid-row-start: 1;
		    width: 100%;
		    height: 100%;
		}
		
		.icon-with-spinner-logo-body{
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
		}
		
		
		.icon-with-spinner__error {
		    position: absolute;
		    inset: 4px;
			border-radius: 1000px;
			box-shadow: 0 0 0 4px #ff00008a;
		}
		
	`;


	render() {
		return html`
			<div class="icon-with-spinner-logo-body"
			style="position: relative; height: 5.875rem; width: 5.875rem;">
				
				<stxconnect-logo
					size="3.4rem"
					radius="15px"
					src="${this.image}"
					border="#ffffff00"
				></stxconnect-logo>
				
				
				<div class="icon-with-spinner__spinner-container ${this.loading?'icon-with-spinner__animation':''}"
				style="height: 5.875rem; width: 5.875rem;">
					
					${this.iserror ? html`
						<div class="icon-with-spinner__error"></div>
					` : ``}
					
					${this.loading ? html`
						<svg viewBox="0 0 42 42" fill="none"
							xmlns="http://www.w3.org/2000/svg" class="icon-with-spinner__spinner" data-testid="spinner"
							style="height: 2.9375rem; width: 2.9375rem;">
							<mask id="path-1-inside-1_1433_60360" fill="white">
								<path
									d="M40.53 42C41.3419 42 42.0027 41.3416 41.9743 40.5303C41.7987 35.5162 40.726 30.5699 38.8029 25.9273C36.6922 20.8316 33.5985 16.2016 29.6985 12.3015C25.7984 8.40145 21.1684 5.30776 16.0727 3.19706C11.4301 1.27403 6.48384 0.201284 1.46972 0.0257219C0.658363 -0.00268681 0 0.658141 0 1.47C0 2.28186 0.658382 2.93711 1.46967 2.96766C6.09758 3.1419 10.6617 4.138 14.9476 5.91326C19.6866 7.87621 23.9925 10.7534 27.6196 14.3804C31.2467 18.0075 34.1238 22.3134 36.0867 27.0524C37.862 31.3383 38.8581 35.9024 39.0323 40.5303C39.0629 41.3416 39.7181 42 40.53 42Z">
								</path>
							</mask>
							<path
								d="M40.53 42C41.3419 42 42.0027 41.3416 41.9743 40.5303C41.7987 35.5162 40.726 30.5699 38.8029 25.9273C36.6922 20.8316 33.5985 16.2016 29.6985 12.3015C25.7984 8.40145 21.1684 5.30776 16.0727 3.19706C11.4301 1.27403 6.48384 0.201284 1.46972 0.0257219C0.658363 -0.00268681 0 0.658141 0 1.47C0 2.28186 0.658382 2.93711 1.46967 2.96766C6.09758 3.1419 10.6617 4.138 14.9476 5.91326C19.6866 7.87621 23.9925 10.7534 27.6196 14.3804C31.2467 18.0075 34.1238 22.3134 36.0867 27.0524C37.862 31.3383 38.8581 35.9024 39.0323 40.5303C39.0629 41.3416 39.7181 42 40.53 42Z"
								stroke="url(#paint0_linear_1433_60360)" stroke-width="4"
								mask="url(#path-1-inside-1_1433_60360)"></path>
							<defs>
								<linearGradient id="paint0_linear_1433_60360" x1="41" y1="42" x2="1.5" y2="-1.82007e-07"
									gradientUnits="userSpaceOnUse">
									<stop stop-color="#02bfae"></stop>
									<stop offset="1" stop-color="#02bfae" stop-opacity="0"></stop>
								</linearGradient>
							</defs>
						</svg>
					` : ``}
					
				</div>				
				
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'stxconnect-loading-spinner': StxconnectLoadingSpinner;
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('stxconnect-loading-spinner')) {
	customElements.define('stxconnect-loading-spinner', StxconnectLoadingSpinner);
}
