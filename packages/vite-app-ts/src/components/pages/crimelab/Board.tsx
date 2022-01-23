import React from 'react';
import { FC } from 'react';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { useContractReader } from 'eth-hooks';
import { Row, Col } from 'antd';
import "antd/dist/antd.css";

export interface IBoardProps {
}

// BILLIARD
// STUDY
// HALL
// LOUNGE
// DINING
// BALLROOM
// CONSERVATORY
// LIBRARY
// KITCHEN

function generateMap(rows: number, cols: number): Map<any, string[]> {
  const startColor = "#d00";
  const roomColor = "#d0d";
  const wallColor = "#333";

  let gameMap: Map<any, string[]> = new Map<any, string[]>([
    [1, [startColor, "🗿"]],
    [7, [startColor, "🕵️‍♂️"]],
    [73, [startColor, "🕵️‍♀️"]],
    [79, [startColor, "👮"]],
    [13, [roomColor, "LOUNGE"]],
    [37, [roomColor, "LIBRARY"]],
    [40, [roomColor, "KITCHEN"]],
    [43, [roomColor, "STUDY"]],
    [67, [roomColor, "BALLROOM"]],
  ]);;

  for (let r = 0; r < rows; ++r) {
    const cellId = r * rows;
    gameMap.set(r * rows, [wallColor, "X"]);
    gameMap.set(r * rows + cols - 1, [wallColor, "X"]);
  }
  for (let c = 2; c < cols - 2; ++c) {
    gameMap.set(c, [wallColor, "X"]);
    gameMap.set(c + (cols * (rows - 1)), [wallColor, "X"]);
  }

  return gameMap;
}

function generateBoard(rows: number, cols: number): any {
  const gameMap = generateMap(rows, cols);

  let board: Array<any> = [];
  for (let r: number = 0; r < rows; r++) {
    let currentColumns: Array<any> = [];
    for (let c: number = 0; c < cols; c++) {
      let cellColor = "#ddd";
      let cellContent = "--";

      const cellId = r * rows + c;
      const props = gameMap.get(cellId);
      if (props != undefined) {
        cellColor = props[0];
        cellContent = props[1];
      }
      const style = { background: cellColor };
      const cell = <Col key={cellId} span={2}><div style={style}>{cellContent}</div></Col>;
      currentColumns.push(cell);
    }
    // TODO add row styling
    board.push(<Row key={r} gutter={[4, 4]}>{currentColumns}</Row>)
  }

  return board;
}

export const Board: FC<IBoardProps> = (props) => {
  const board = generateBoard(9, 9)
  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 800, margin: 'auto', marginTop: 64 }}>
      {board}
    </div>
  );
}