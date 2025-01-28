import { ethers } from 'ethers';
import type { OnboardAPI } from '@web3-onboard/core';

import { browser } from '$app/environment';

import { network } from '$lib/blockchain/Network';
import { NetworkReader } from '$lib/blockchain/NetworkReader';
import { get, writable } from 'svelte/store';
import { PUBLIC_LEDGER_WALLETCONNECT_PROJECT_ID } from '$env/static/public';

export const ethPrice = writable(0);
export const provider = writable<ethers.BrowserProvider>();
// export const networkReader = new Store<NetworkReader>(new NetworkReader());
export const networkReader = new NetworkReader();
export const connectedAccount = writable('');
export const chainId = writable(0);
export const web3Onboard = writable<OnboardAPI>();

let unsubscribe: any;
web3Onboard.subscribe((onboard) => {
	if (!onboard || !browser) return;
	unsubscribe?.();

	// networkReader.init();

	const wallets = onboard.state.select('wallets');
	unsubscribe = wallets.subscribe((state) => {
		const activeWallet = state?.[0];
		if (activeWallet) {
			const activeAccount = activeWallet.accounts?.[0];
			const activeChain = activeWallet.chains?.[0];
			if (activeAccount) {
				if (!activeChain || activeChain.id !== network.blocknative.id) {
					// connectedAccount.set('');
					chainId.set(0);
					console.info('no active chain yet');
					onboard.setChain({ chainId: network.blocknative.id }).catch((err) => {
						console.error('wallet: failed to setChain', err);
					});
				} else {
					console.info('active chain', activeChain.id);
					chainId.set(Number(activeChain.id));
					// const networkAlias = getNetworkAliasByChainId(activeChain.id);
					// setNetworkAliasInQueryParams(networkAlias);
					provider.set(new ethers.BrowserProvider(activeWallet.provider, 'any'));
				}
				connectedAccount.set(activeAccount.address);
			} else {
				console.log('no active account');
				connectedAccount.set('');
			}
		} else {
			console.log('no active wallet');
			connectedAccount.set('');
		}
	}).unsubscribe;
});

browser && setTimeout(initialize, 500);
async function initialize() {
	const Onboard = (await import('@web3-onboard/core')).default;
	const injected = (await import('@web3-onboard/injected-wallets')).default();
	const ledger = (await import('@web3-onboard/ledger')).default({
		walletConnectVersion: 2,
		/**
		 * Project ID associated with [WalletConnect account](https://cloud.walletconnect.com)
		 */
		projectId: PUBLIC_LEDGER_WALLETCONNECT_PROJECT_ID,
		requiredChains: [1]
	});
	// const walletConnect = (await import('@web3-onboard/walletconnect')).default({
	// 	projectId: PUBLIC_LEDGER_WALLETCONNECT_PROJECT_ID,
	// 	requiredChains: [1]
	// });

	const wallets = [injected, ledger];

	const appMetadata = {
		name: 'Merge Trees',
		icon: '/favicon-96x96.png',
		explore: 'https://themergetrees.xyz/',
		description: 'A generative art experiment to build an on-chain evolving forest.',
		recommendedInjectedWallets: [{ name: 'MetaMask', url: 'https://metamask.io' }]
	};

	const onboard = Onboard({
		wallets,
		chains: [network.blocknative],
		appMetadata,
		i18n: {},
		connect: {
			autoConnectLastWallet: true
		}
	});
	web3Onboard.set(onboard);
}

export async function connect() {
	if (!get(web3Onboard) || !get(web3Onboard).state.get().chains.length) {
		await initialize();
	}
	const onboard = get(web3Onboard);
	if (!onboard) throw Error('web3Onboard is not set');
	console.log('try connect');
	const wallets = await onboard.connectWallet();
	return wallets;
}

export async function disconnect() {
	const onboard = get(web3Onboard);
	if (!onboard) throw Error('web3Onboard is not set');
	await onboard.disconnectWallet({
		label: onboard?.state?.get()?.chains?.[0]?.label
	});
	console.log('disconnected');
	connectedAccount.set('');
}

export function getSupportedNetworks() {
	const onboard = get(web3Onboard);
	if (!onboard) return [];
	return onboard.state.get().chains;
}

export async function switchNetwork(_chainId: number | string) {
	const onboard = get(web3Onboard);
	if (!onboard) return;
	await onboard.setChain({
		chainId: `0x${Number(_chainId).toString(16)}`
	});
}
