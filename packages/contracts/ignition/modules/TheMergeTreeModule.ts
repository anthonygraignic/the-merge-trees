import {buildModule} from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('TheMergeTrees', (m) => {
  const deployer = m.getAccount(0);
  const founders = m.getAccount(1);

  const renderer = m.library('TheMergeTreesRenderer');

  const seeder = m.contract('TheMergeTreeSeeder', [], {
    from: deployer,
  });

  const beforeHuntLimitPerAddress = m.getParameter('beforeHuntLimitPerAddress', 3);

  const token = m.contract('TheMergeTree', [deployer, founders, beforeHuntLimitPerAddress, seeder], {
    from: deployer,
    libraries: {
      TheMergeTreesRenderer: renderer,
    },
  });

  return {renderer, seeder, token};
});
