import {buildModule} from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('ComposableTestToken', (m) => {
  const deployer = m.getAccount(0);
  const founders = m.getAccount(1);

  const token = m.contract('ComposableTestToken', [], {
    from: deployer,
  });

  return {token};
});
