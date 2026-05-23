export async function getChainId(
	provider : any
) : Promise<number> {

	const chainId = await provider.request({
		method: 'eth_chainId'
	});

	const normalizedChainId = Number(chainId);

	if (!Number.isFinite(normalizedChainId)) {
		throw new Error(`Invalid chain id returned by wallet: ${chainId}`);
	}

	return normalizedChainId;
}
