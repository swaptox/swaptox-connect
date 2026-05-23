
//https://www.npmjs.com/package/@coinbase/wallet-sdk
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';



export class coinbaseWalletCore {
	sdk: any = null;
	provider: any = null;
	constructor(config: any = {}) {
		this.sdk = new CoinbaseWalletSDK(config);
		this.provider = this.sdk.makeWeb3Provider();
	}
}



export function coinbaseWallet(config: any) {
	return new coinbaseWalletCore(config);
}
