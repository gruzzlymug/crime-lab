import { FC, useContext } from 'react';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { useGasPrice } from 'eth-hooks';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { CrimeLab } from '~~/generated/contract-types';
import { logTransactionUpdate } from '~~/components/common';
import 'antd/dist/antd.css';
// TODO maybe get rid of this (and use of BigNumber below)
import { BigNumber } from 'ethers';

export interface IBoardProps {
  cells: BigNumber[],
}

interface Dimensions {
  rows: number,
  cols: number
};

// TODO centralize flags and masks
function generateMap(dims: Dimensions, cells: BigNumber[]): string[][] {
  const corridorColor = "#ddd";
  const startColor = "#d00";
  const roomColor = "#dd0";
  const doorColor = "#bb0";
  const passageColor = "#550";

  let gameMap: string[][] = [];

  for (let i = 0; i < cells.length; ++i) {
    const mapBits = cells[i].toNumber() & 0xffffffff;
    const gameBits = cells[i].shr(32).toNumber() & 0xffffffff;

    let cellColor = "#f00";
    let cellOccupant = "";
    let isReachable = false;

    const occupantType = gameBits & 0x0f;
    switch (occupantType) {
      case 0:
        // nothing
        break;
      case 1:
        // TODO constrain player id to valid range
        const playerId = (gameBits & 0xf0) >> 4;
        cellOccupant = ["🗿", "🕵️", "👻", "👮"][playerId];
        break;
    }

    isReachable = (gameBits & (0x01 << 12)) === (0x01 << 12);

    const cellType = mapBits & 0x0f;
    const groupId = (mapBits & 0xf0) >> 4;
    switch (cellType) {
      case 0:
        cellColor = isReachable ? "#bbc" : corridorColor;
        break;
      case 1:
        // TODO unused
        // cellColor = ;
        break;
      case 2:
        cellColor = roomColor;
        break;
      case 3:
        cellColor = isReachable ? "#880" : doorColor;
        break;
      case 4:
        cellColor = startColor;
        break;
      case 5:
        const targetGroupId = (mapBits & 0xf00) >> 8;
        cellColor = passageColor;
        break;
    }

    // TODO FIX. using gameMap: (string|boolean) breaks generateBoard since background must be a string
    gameMap.push([cellColor, cellOccupant, isReachable ? "true" : "false"]);
  }

  return gameMap;
}

function generateBoard(dims: Dimensions, moveHandler: any, gameMap: string[][]): Array<JSX.Element> {
  let board: Array<JSX.Element> = [];
  // TODO ¿improve?
  if (gameMap.length === 0) {
    return board;
  }

  for (let r: number = 0; r < dims.rows; r++) {
    let currentColumns: Array<JSX.Element> = [];
    for (let c: number = 0; c < dims.cols; c++) {
      const cellId = r * dims.cols + c;
      const props = gameMap[cellId];
      const cellColor = props[0];
      const cellContent = props[1];
      // NOTE see generateMap for explanation of string-as-bool usage
      const isReachable = props[2] === "true";

      const cellSize = '2.0em';
      const cellStyle = { background: cellColor, width: cellSize, height: cellSize, fontSize: 9, padding: 2 };
      const clickHandler = isReachable ? moveHandler : undefined;
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

export const Board: FC<IBoardProps> = ({ cells }) => {
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
  const board = generateBoard(boardDims, handleCellClick, map);

  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, display: 'flex', justifyContent: 'center' }}>
      <div>
        {board}
      </div>
    </div >
  );
}
