export const ssr = false;
export async function load({ params, fetch }) {
	// const baseURL =
	// 	'https://eth-goerli.g.alchemy.com/v2/DowzHAQlBiuK4la464JxsZycwLAYalcR/getNFTMetadata';
	// // `${baseURL}?contractAddress=${vars.CONTRACT_ADDRESS.toLowerCase()}&tokenId=${params.tokenId}&tokenType=erc721}`,
	// const url = `https://eth-goerli.g.alchemy.com/v2/DowzHAQlBiuK4la464JxsZycwLAYalcR/getNFTMetadata?contractAddress=0x51839232bbe1f17b12147bb186d40d4e0a08ac5f&tokenId=${params.tokenId}&tokenType=erc721`;
	// const res = await fetch({ method: 'GET', redirect: 'follow', url });
	// // https://eth-goerli.g.alchemy.com/v2/DowzHAQlBiuK4la464JxsZycwLAYalcR/getNFTMetadata?contractAddress=0x51839232bbe1f17b12147bb186d40d4e0a08ac5f&tokenId=0&tokenType=erc721
	// return {
	// 	status: res.status,
	// 	props: {
	// 		tokenId: params.tokenId,
	// 		nft: res.ok && (await res.json())
	// 	}
	// };
	// error(404, 'Not found');

	return {
		tokenId: params.tokenId
	};
}
