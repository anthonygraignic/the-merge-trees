export function shortenAddress(address: string, start = 6, end = -4) {
	if (!address) {
		return '';
	}

	return `${address.slice(0, start)}..${address.slice(end)}`;
}

export function solTimestampToDate(timestamp: number) {
	return new Date(timestamp * 1000);
}
