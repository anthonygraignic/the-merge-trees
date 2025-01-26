# The Merge Trees Website

Made with [Svelte & SvelteKit](https://svelte.dev/docs/kit/introduction/) and [TailwindCSS](https://tailwindcss.com/),

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm build
```

You can preview the production build with `pnpm preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

### Local dev

After you deployed an ethereum network and the smartcontracts using Harhdat as described in [contracts' README](../contracts/README.md).

You can update your `.env` with the following vars:

```
PUBLIC_NETWORK=hardhat
PUBLIC_MERGETREES_CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

And then run `pnpm dev` to host the website locally.

# Credits

- [Twemoji for favicon](https://github.com/twitter/twemoji) CC-BY 4.0
