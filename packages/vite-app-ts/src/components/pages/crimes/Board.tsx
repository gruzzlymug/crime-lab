import { FC, useContext, useState } from 'react';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { useContractReader, useGasPrice } from 'eth-hooks';
import { transactor, TTransactorFunc } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { Button, Row, Col } from 'antd';
import { CrimeLab } from '~~/generated/contract-types';
import { logTransactionUpdate } from '~~/components/common';
import 'antd/dist/antd.css';

export interface IBoardProps {
  players: any[]
}

interface Dimensions {
  rows: number,
  cols: number
};

function generateMap(dims: Dimensions): Map<number, string[]> {
  const startColor = "#d00";
  const roomColor = "#d0d";
  const wallColor = "#333";

  let gameMap: Map<number, string[]> = new Map<number, string[]>([
    [1, [startColor, "■"]],
    [7, [startColor, "■"]],
    [73, [startColor, "■"]],
    [79, [startColor, "■"]],
    [13, [roomColor, "LOUNGE"]],
    [37, [roomColor, "LIBRARY"]],
    [40, [roomColor, "KITCHEN"]],
    [43, [roomColor, "STUDY"]],
    [67, [roomColor, "BALLROOM"]],
  ]);;

  // add walls around the edge
  for (let r = 0; r < dims.rows; ++r) {
    const cellId = r * dims.rows;
    gameMap.set(r * dims.rows, [wallColor, "X"]);
    gameMap.set(r * dims.rows + dims.cols - 1, [wallColor, "X"]);
  }
  for (let c = 2; c < dims.cols - 2; ++c) {
    gameMap.set(c, [wallColor, "X"]);
    gameMap.set(c + (dims.cols * (dims.rows - 1)), [wallColor, "X"]);
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

      const cellId = r * dims.rows + c;
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

      const cellStyle = { background: cellColor, width: '4em', height: '4em', fontSize: 9 };
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

export const Board: FC<IBoardProps> = ({ players }) => {
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

  const boardDims: Dimensions = { rows: 9, cols: 9 };
  const map = generateMap(boardDims);
  const board = generateBoard(boardDims, handleCellClick, map, players);

  const handleEndTurnButtonClick = async () => {
    const result = tx?.(crimeLabContract?.endTurn(), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, }}>
      {board}
      <div style={{ margin: 'auto' }}><Button onClick={handleEndTurnButtonClick}>End Turn</Button></div>
    </div >
  );
}
