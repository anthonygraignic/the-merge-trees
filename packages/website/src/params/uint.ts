/**
 * @param {string} param
 * @return {boolean}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param): boolean {
	const num = Number(param);
	return Number.isInteger(num) && num >= 0;
}
