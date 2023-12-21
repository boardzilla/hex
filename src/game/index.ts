import {
  createGame,
  createBoardClasses,
  Player,
  Board,
  playerActions,
  loop,
  eachPlayer,
} from '@boardzilla/core';

import graphology from 'graphology';
import {allSimplePaths} from 'graphology-simple-path';

export class HexPlayer extends Player<HexPlayer, HexBoard> {
};

class HexBoard extends Board<HexPlayer, HexBoard> {
  isConnected(player: HexPlayer) {
    const graph = new graphology.UndirectedGraph();
    for (const cell of this.all(Cell, {player})) {
      if (!graph.hasNode(cell.id())) graph.addNode(cell.id());
      for (const adj of cell.adjacencies(Cell, {player})) {
        if (!graph.hasNode(adj.id())) graph.addNode(adj.id());
        if (!graph.hasEdge(cell.id(), adj.id())) graph.addEdge(cell.id(), adj.id());
      }
    }
    graph.addNode('start');
    graph.addNode('end');
    if (player.position === 1) {
      for (const cell of this.all(Cell, {row: 1})) {
        if (!graph.hasNode(cell.id())) graph.addNode(cell.id());
        if (!graph.hasEdge('start', cell.id())) graph.addEdge('start', cell.id());
      }
      for (const cell of this.all(Cell, {row: this.gameSetting('size')})) {
        if (!graph.hasNode(cell.id())) graph.addNode(cell.id());
        if (!graph.hasEdge('end', cell.id())) graph.addEdge('end', cell.id());
      }
    } else {
      for (const cell of this.all(Cell, {column: 1})) {
        if (!graph.hasNode(cell.id())) graph.addNode(cell.id());
        if (!graph.hasEdge('start', cell.id())) graph.addEdge('start', cell.id());
      }
      for (const cell of this.all(Cell, {column: this.gameSetting('size')})) {
        if (!graph.hasNode(cell.id())) graph.addNode(cell.id());
        if (!graph.hasEdge('end', cell.id())) graph.addEdge('end', cell.id());
      }
    }
    return allSimplePaths(graph, 'start', 'end').length > 0;
  }
}

const { Space } = createBoardClasses<HexPlayer, HexBoard>();

export class Cell extends Space {
  row: number;
  column: number;
  id() {
    return this.row + ',' + this.column;
  }
}

export default createGame(HexPlayer, HexBoard, game => {
  const { board, action } = game;

  board.registerClasses(Cell);

  board.createGrid({
    rows: board.gameSetting('size'),
    columns: board.gameSetting('size'),
    style: 'hex-inverse'
  }, Cell, 'cell', (row, column) => ({ row, column }));

  game.defineActions({
    place: player => action({
      prompt: 'Place your stone',
    }).chooseOnBoard(
      'space', board.all(Cell, {player: undefined})
    ).do(({ space }) => { space.player = player })
  });

  game.defineFlow(loop(
    eachPlayer({
      name: 'player',
      do: [
        playerActions({
          actions: [ 'place' ]
        }),
        ({ player }) => {
          if (board.isConnected(player)) game.finish(player);
        }
      ]
    })
  ));
});
