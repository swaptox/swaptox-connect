
import type { Chain } from 'viem';

import {
	mainnet,
	bsc,
	base,
	arbitrum,
	optimism,
	polygon,
	rootstock
} from 'viem/chains';


export const CHAINS = {
	mainnet,
	bsc,
	base,
	arbitrum,
	optimism,
	polygon,
	rootstock
};

export const CHAINS_ID = {
	[mainnet.id]: mainnet,
	[bsc.id]: bsc,
	[base.id]: base,
	[arbitrum.id]: arbitrum,
	[optimism.id]: optimism,
	[polygon.id]: polygon,
	[rootstock.id]: rootstock,
};


export const DEFAULT_CHAINS = ['base', 'rootstock'];

export type ChainKey = keyof typeof CHAINS;

/**
 * Get chain config by:
 * - chain id (8453)
 * - chain key ('base')
 * - chain object
 */
export function GET_CHAINS(
	chain: number | string | Chain
): Chain | null {

	// 1. already chain object
	if (
		typeof chain === 'object' &&
		chain !== null &&
		'id' in chain
	) {
		return chain as Chain;
	}

	// 2. chain id
	if (typeof chain === 'number') {
		return CHAINS_ID[chain as keyof typeof CHAINS_ID] ?? null;
	}

	// 3. chain name
	if (typeof chain === 'string') {
		const chainId = Number(chain);
		if (Number.isInteger(chainId) && String(chainId) === chain.trim()) {
			return CHAINS_ID[chainId as keyof typeof CHAINS_ID] ?? null;
		}

		return CHAINS[chain as ChainKey] ?? null;
	}

	return null;
}

