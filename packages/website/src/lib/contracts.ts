import { ethers } from 'ethers';

import mergeTreesArtifact from 'merge-trees-contracts/artifacts/contracts/TheMergeTree.sol/TheMergeTree.json';
import { PUBLIC_MERGETREES_CONTRACT_ADDRESS } from '$env/static/public';

import type { TheMergeTree } from 'merge-trees-contracts/typechain/contracts/TheMergeTree';
import { networkReader } from './wallet';

export const mergeTrees = new ethers.Contract(
	PUBLIC_MERGETREES_CONTRACT_ADDRESS,
	mergeTreesArtifact.abi,
	networkReader
) as TheMergeTree;
export const mergeTreesABI = mergeTreesArtifact.abi;

export type { TheMergeTree };
