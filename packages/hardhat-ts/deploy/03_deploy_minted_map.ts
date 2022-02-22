import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy('MintedMap', {
    from: deployer,
    log: true,
  });
  await deploy('Loot', {
    from: deployer,
    log: true,
  });
  await deploy('Bones', {
    from: deployer,
    log: true,
  });
  await deploy('Blitmap', {
    from: deployer,
    log: true,
  });

};
export default func;
func.tags = ['MintedMap'];
