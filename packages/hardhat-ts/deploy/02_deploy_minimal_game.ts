import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const choiceVerifier = await deploy('ChoiceVerifier', {
    from: deployer,
    log: true,
  })

  await deploy('MinimalGame', {
    from: deployer,
    log: true,
    args: [choiceVerifier["address"]]
  });

};
export default func;
func.tags = ['MinimalGame'];
