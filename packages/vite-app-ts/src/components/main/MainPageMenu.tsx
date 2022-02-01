import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Grid } from 'antd';
const { useBreakpoint } = Grid

export interface IMainPageMenuProps {
  route: string;
  setRoute: React.Dispatch<React.SetStateAction<string>>;
}

export const MainPageMenu: FC<IMainPageMenuProps> = (props) => {
  const { md } = useBreakpoint()
  if (md === false) {
    // do not show the menu on small screens
    return null
  }
  return (
    <Menu
      style={{
        textAlign: 'center',
      }}
      selectedKeys={[props.route]}
      mode="horizontal">
      <Menu.Item key="/">
        <Link
          onClick={() => {
            props.setRoute('/');
          }}
          to="/">
          Crimes
        </Link>
      </Menu.Item>
      <Menu.Item key="/yourcontract">
        <Link
          onClick={() => {
            props.setRoute('/yourcontract');
          }}
          to="/yourcontract">
          YourContract
        </Link>
      </Menu.Item>
      <Menu.Item key="/crimelab">
        <Link
          onClick={() => {
            props.setRoute('/crimelab');
          }}
          to="/crimelab">
          CrimeLab
        </Link>
      </Menu.Item>
      <Menu.Item key="/minimalgame">
        <Link
          onClick={() => {
            props.setRoute('/minimalgame');
          }}
          to="/minimalgame">
          MinimalGame
        </Link>
      </Menu.Item>
      <Menu.Item key="/hints">
        <Link
          onClick={() => {
            props.setRoute('/hints');
          }}
          to="/hints">
          Hints
        </Link>
      </Menu.Item>
      <Menu.Item key="/exampleui">
        <Link
          onClick={() => {
            props.setRoute('/exampleui');
          }}
          to="/exampleui">
          ExampleUI
        </Link>
      </Menu.Item>
      <Menu.Item key="/mainnetdai">
        <Link
          onClick={() => {
            props.setRoute('/mainnetdai');
          }}
          to="/mainnetdai">
          Mainnet DAI
        </Link>
      </Menu.Item>
      {/* <Menu.Item key="/subgraph">
      <Link
        onClick={() => {
          props.setRoute('/subgraph');
        }}
        to="/subgraph">
        Subgraph
      </Link>
    </Menu.Item> */}
    </Menu>
  )
}
