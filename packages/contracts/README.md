# The Merge Trees Smartcontracts

Ethereum smartcontracts developed in [Solidity](https://soliditylang.org/) using [Hardhat](https://hardhat.org/) dev tools and [OpenZeppelin Contracts lib](https://www.openzeppelin.com/solidity-contracts).

## Development

```shell
pnpm clean
pnpm compile
```

### Local network

You can deploy your own EVM blockchain and deploy contracts on it using `pnpm dev` and `pnpm dev:deploy`.

Launch the website with `hardhat` env network following the [website's README](../website/README.md).

### Tests

Various tests were made (units, integration and QA) that you can find in [test](./test/) folder

```shell
pnpm t
pnpm coverage
pnpm size
pnpm gas
```

Typescript files are generated with the [typechain](https://github.com/dethcrypto/TypeChain) lib and make test dev easier.
