import { numberToHex } from 'viem';

export async function switchChain(
	provider: any,
	chainId: number
) {
	if (!Number.isFinite(chainId) || chainId <= 0) {
		throw new Error(`Invalid chain id: ${chainId}`);
	}

	return provider.request({
		method: 'wallet_switchEthereumChain',
		params: [
			{
				chainId: numberToHex(chainId)
			}
		]
	});
}
