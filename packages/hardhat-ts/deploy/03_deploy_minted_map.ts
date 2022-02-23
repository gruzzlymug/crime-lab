import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy('Bones', {
    from: deployer,
    log: true,
  });
  await deploy('MintedMap', {
    from: deployer,
    log: true,
  });
  await deploy('Blitmap', {
    from: deployer,
    log: true,
  });

  const loot = await deploy('Loot', {
    from: deployer,
    log: true,
  });
  const render = await deploy('dungeonsRender', {
    from: deployer,
    log: true,
  });
  const generator = await deploy('dungeonsGenerator', {
    from: deployer,
    log: true,
  });
  const seeder = await deploy('dungeonsSeeder', {
    from: deployer,
    log: true,
  });

  const options = {
    from: deployer,
    log: true,
    args: [render["address"], generator["address"], seeder["address"]]
  };
  await deploy('Dungeons', options);

};
export default func;
func.tags = ['MintedMap'];
