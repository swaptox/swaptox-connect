import { detectWalletsEIP6963, searchWalletEIP6963 } from './eip6963Wallet';

export const injectedConnector = {
	detectWallets: detectWalletsEIP6963,
	searchWallet: searchWalletEIP6963
};
