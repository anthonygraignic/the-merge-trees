import { ethers } from 'ethers';
import type { Network } from './Network';
import { network as globalNetwork } from './Network';
import { writable } from 'svelte/store';

export const networkReadiness = writable(false);

export class NetworkReader {
	private _provider!: ethers.WebSocketProvider;
	private _network: Network;

	constructor(network: Network | undefined = undefined) {
		this._network = network || globalNetwork;
	}

	get network() {
		return this._network;
	}

	get ready() {
		return this._provider?._websocket.readyState;
	}

	get() {
		return this._provider;
	}

	set(network: Network) {
		if (this._provider) {
			this.close();
		}
		this._network = network;
		this.init();
	}

	init() {
		const provider = new ethers.WebSocketProvider(this._network.wssUrl, this._network.ethers);
		const defWsOpen = provider._websocket.onopen;
		const defWsClose = provider._websocket.onclose;
		provider._websocket.reconnect = true;
		provider._websocket.onopen = (event: any) => {
			provider._websocket.keepAliveInterval = setInterval(() => {
				if (
					provider._websocket.readyState === WebSocket.OPEN ||
					provider._websocket.readyState === WebSocket.CONNECTING
				) {
					if (import.meta.env.DEV) console.info('networkReader: pong');
					return;
				}
				provider._websocket.terminate();
			}, 5000);

			if (defWsOpen) defWsOpen(event);
			networkReadiness.set(true);
		};
		provider._websocket.onclose = (event: any) => {
			clearInterval(provider._websocket.keepAliveInterval);

			if (defWsClose) defWsClose(event);
			networkReadiness.set(false);
			if (provider._websocket.reconnect) {
				this.init();
			}
		};
		this._provider = provider;
	}

	close() {
		if (!this._provider) return;
		this._provider._websocket.reconnect = false;
		this._provider._websocket.close();
	}
}
