






export async function connect(provider : any) {
	
	if (!provider || typeof provider.request !== 'function') {
		throw new Error('Detected wallet does not expose a valid provider');
	}

	let accounts : string[];
	try {
		accounts = await provider.request({ method: 'eth_requestAccounts' });
	} catch (err : any) {
		const error = new Error(`Failed to connect to wallet: ${err.message || err}`);
		(error as any).code = err?.code;
		(error as any).data = err?.data;
		(error as any).cause = err;
		throw error;
	}

	if (!Array.isArray(accounts)) {
		throw new Error('Wallet returned an invalid accounts response');
	}

	if (accounts.length === 0) {
		throw new Error(`Wallet did not return any accounts`);
	}

	return accounts;
}



