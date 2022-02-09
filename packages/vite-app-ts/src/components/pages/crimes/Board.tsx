import { FC, useContext, useState } from 'react';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { useContractReader, useGasPrice } from 'eth-hooks';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { Button, Row, Col } from 'antd';
import { CrimeLab } from '~~/generated/contract-types';
import { logTransactionUpdate } from '~~/components/common';
import 'antd/dist/antd.css';
// TODO maybe get rid of this (and use of BigNumber below)
import { BigNumber } from 'ethers';

export interface IBoardProps {
  cells: BigNumber[],
  players: any[]
}

interface Dimensions {
  rows: number,
  cols: number
};

function generateMap(dims: Dimensions, cells: BigNumber[]): Map<number, string[]> {
  const corridorColor = "#ddd";
  const startColor = "#d00";
  const roomColor = "#dd0";
  const doorColor = "#bb0";
  const wallColor = "#333";

  // TODO now that all cells are explicitly set, a map may be overkill
  let gameMap: Map<number, string[]> = new Map<number, string[]>();

  for (let i = 0; i < cells.length; ++i) {
    let cellProps;
    // TODO get rid of toNumber here
    switch (cells[i].toNumber()) {
      case 0:
        cellProps = [corridorColor, ""];
        break;
      case 1:
        cellProps = [wallColor, ""];
        break;
      case 2:
        cellProps = [roomColor, ""];
        break;
      case 3:
        cellProps = [doorColor, ""];
        break;
      case 4:
        cellProps = [startColor, "■"];
        break;
      default:
        cellProps = ["#f00", "X"];
    }
    gameMap.set(i, cellProps);
  }

  return gameMap;
}

function generateBoard(dims: Dimensions, clickHandler: any, gameMap: Map<number, string[]>, players: any[]): Array<JSX.Element> {
  let board: Array<JSX.Element> = [];
  for (let r: number = 0; r < dims.rows; r++) {
    let currentColumns: Array<JSX.Element> = [];
    for (let c: number = 0; c < dims.cols; c++) {
      let cellColor = "#ddd";
      let cellContent = "□";

      const cellId = r * dims.cols + c;
      const props = gameMap.get(cellId);

      if (props != undefined) {
        cellColor = props[0];
        cellContent = props[1];
      }

      // TODO refine
      const playerIcons: Map<string, string> = new Map([
        ["0", "🗿"],
        ["1", "🕵️"],
        ["2", "🕵️"],
        ["3", "👮"],
      ]);
      for (let i in players) {
        if (cellId === players[i]['position'].toNumber()) {
          cellContent = playerIcons.get(i) || "--";
          break;
        }
      }

      const cellSize = '2.0em';
      const cellStyle = { background: cellColor, width: cellSize, height: cellSize, fontSize: 9, padding: 2 };
      const cell = <button key={cellId} id={`${cellId}`} style={cellStyle} onClick={clickHandler}>
        {cellContent}
      </button>
      currentColumns.push(cell);
    }

    const rowStyle = { display: 'flex', gap: 4, marginBottom: 4, minWidth: 'fit-content' }
    board.push(<div key={r} style={rowStyle}>{currentColumns}</div>)
  }

  return board;
}

export const Board: FC<IBoardProps> = ({ cells, players }) => {
  const ethersContext = useEthersContext();

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);

  const handleCellClick = async (e: any) => {
    const cellId = parseInt(e.target.id);
    const result = tx?.(crimeLabContract?.setPlayerPosition(cellId), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  const boardDims: Dimensions = { rows: 25, cols: 24 };
  const map = generateMap(boardDims, cells);
  const board = generateBoard(boardDims, handleCellClick, map, players);

  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, display: 'flex', justifyContent: 'center' }}>
      <div>
        {board}
      </div>
    </div >
  );
}
