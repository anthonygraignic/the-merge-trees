import { ethers } from 'ethers';
import { PUBLIC_INFURA_PROJECT_ID, PUBLIC_NETWORK } from '$env/static/public';

export class Network {
	private readonly _network: ethers.providers.Network;
	private readonly _httpsUrl: string;
	private readonly _wssUrl: string;

	static getNetwork(networkish: ethers.providers.Networkish): Network {
		let network;
		switch (networkish) {
			case '31337':
			case 31337:
			case 'hardhat':
				network = {
					chainId: 31337,
					name: 'hardhat'
				};
				break;
			case 'sepolia':
				network = {
					chainId: 11155111,
					name: 'sepolia'
				};
				break;
			default:
				network = ethers.providers.getNetwork(networkish);
		}
		return new Network(network);
	}

	private constructor(network: ethers.providers.Network) {
		this._network = network;
		switch (this._network.chainId) {
			case 31337:
				this._httpsUrl = 'http://localhost:8545';
				this._wssUrl = 'ws://localhost:8545';
				break;
			default:
				this._httpsUrl = `https://${this.name}.infura.io/v3/${PUBLIC_INFURA_PROJECT_ID}`;
				this._wssUrl = `wss://${this.name}.infura.io/ws/v3/${PUBLIC_INFURA_PROJECT_ID}`;
		}
	}

	get name() {
		switch (this._network.chainId) {
			case 1:
				return 'mainnet';
			default:
				return this.ethers.name;
		}
	}

	get ethers() {
		return this._network;
	}

	get blocknative() {
		return {
			id: '0x'.concat(this._network.chainId.toString(16)),
			token: 'ETH',
			label: this._network.name,
			rpcUrl: this.httpsUrl
		};
	}

	get httpsUrl() {
		return this._httpsUrl;
	}

	get wssUrl() {
		return this._wssUrl;
	}
}

export const network = Network.getNetwork(PUBLIC_NETWORK);
