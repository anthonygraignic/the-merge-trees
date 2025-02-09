import { sveltekit } from '@sveltejs/kit/vite';
import inject from '@rollup/plugin-inject';

import type { UserConfig } from 'vite';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const MODE = process.env.NODE_ENV;
const development = MODE === 'development';

/** @type {import('@sveltejs/kit').Config} */

const config: UserConfig = {
	plugins: [
		sveltekit(),
		development &&
			nodePolyfills({
				include: ['node_modules/**/*.js', new RegExp('node_modules/.vite/.*js'), 'http', 'crypto']
			})
	],
	resolve: {
		alias: {
			crypto: 'crypto-browserify',
			stream: 'stream-browserify',
			assert: 'assert',
			zlib: 'browserify-zlib'
		}
	},
	build: {
		rollupOptions: {
			external: ['@web3-onboard/*'],
			plugins: [
				nodePolyfills({ include: ['crypto', 'http'] }),
				inject({ Buffer: ['buffer', 'Buffer'], 'globalThis.Buffer': ['buffer', 'Buffer'] })
			]
		},
		commonjsOptions: {
			transformMixedEsModules: true
		}
	},
	optimizeDeps: {
		exclude: ['@ethersproject/hash', 'wrtc', 'http'],
		include: [
			'@web3-onboard/core',
			'@web3-onboard/gas',
			'@web3-onboard/sequence',
			'js-sha3',
			'@ethersproject/bignumber'
		],
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis'
			}
		}
	},

	define: {
		global: 'window'
	}
};
export default config;
