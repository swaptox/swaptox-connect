import { numberToHex } from 'viem';
import type { Chain } from 'viem';

export async function addChain(
	provider: any,
	currentChain: Chain
) {
	const rpcUrls = currentChain.rpcUrls?.default?.http?.filter(Boolean) ?? [];
	if (!rpcUrls.length) {
		throw new Error(`Chain ${currentChain.id} does not define an RPC URL`);
	}

	const blockExplorerUrl = currentChain.blockExplorers?.default?.url;
	const params: Record<string, any> = {
		chainId: numberToHex(currentChain.id),
		chainName: currentChain.name,
		nativeCurrency: currentChain.nativeCurrency,
		rpcUrls
	};

	if (blockExplorerUrl) {
		params.blockExplorerUrls = [blockExplorerUrl];
	}

	return provider.request({
		method: 'wallet_addEthereumChain',
		params: [params]
	});
}
