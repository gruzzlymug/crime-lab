import React from 'react';
import { FC } from 'react';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { useContractReader } from 'eth-hooks';
import { Button, Input, List, Row, Col } from 'antd';
import { Address } from 'eth-components/ant';
import "antd/dist/antd.css";

export interface IBoardProps {
}

// example: "00" -> "room name"
const rooms: Map<string, string> = new Map<string, string>([
  ["04", "ROOM 1"],
  ["48", "ROOM 2"],
  ["84", "ROOM 3"],
  ["40", "ROOM 4"],
  ["44", "ROOM 5"],
]);

function getCell(row: number, col: number): any {
  const cellId = row.toString() + col.toString();
  const roomName: any = rooms.get(cellId)
  let cellContents: any = '';
  if (roomName) {
    cellContents = roomName;
  }
  else {
    cellContents = cellId;
  }
  // TODO add column styling
  return <Col span={2}>{cellContents}</Col>
}

function generateBoard(rows: number, columns: number): any {
  let board: Array<any> = [];
  for (let r: number = 0; r < rows; r++) {
    let currentColumns: Array<any> = [];
    for (let c: number = 0; c < columns; c++) {
      const cell = getCell(r, c);
      currentColumns.push(cell);
    }
    // TODO add row styling
    board.push(<Row gutter={[4, 4]}> {currentColumns} </Row>)
  }

  return board;
}

export const Board: FC<IBoardProps> = (props) => {
  const board = generateBoard(9, 9)
  return (
    <div>
      <h3>Board</h3>
      {board}
    </div>
  );
}