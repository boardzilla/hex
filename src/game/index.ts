import {
  createGame,
  Player,
  Space,
  HexGrid,
  Game,
} from '@boardzilla/core';

import graphology from 'graphology';
import {allSimplePaths} from 'graphology-simple-path';

export class HexPlayer extends Player<Hex, HexPlayer> {
};

class Hex extends Game<Hex, HexPlayer> {
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
      for (const cell of this.all(Cell, {row: this.setting('size')})) {
        if (!graph.hasNode(cell.id())) graph.addNode(cell.id());
        if (!graph.hasEdge('end', cell.id())) graph.addEdge('end', cell.id());
      }
    } else {
      for (const cell of this.all(Cell, {column: 1})) {
        if (!graph.hasNode(cell.id())) graph.addNode(cell.id());
        if (!graph.hasEdge('start', cell.id())) graph.addEdge('start', cell.id());
      }
      for (const cell of this.all(Cell, {column: this.setting('size')})) {
        if (!graph.hasNode(cell.id())) graph.addNode(cell.id());
        if (!graph.hasEdge('end', cell.id())) graph.addEdge('end', cell.id());
      }
    }
    return allSimplePaths(graph, 'start', 'end').length > 0;
  }
}

export class Cell extends Space<Hex> {
  row: number;
  column: number;
  id() {
    return this.row + ',' + this.column;
  }
}

export default createGame(HexPlayer, Hex, game => {
  const { action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;

  game.registerClasses(Cell, HexGrid);

  game.create(HexGrid, 'hex', {
    rows: game.setting('size'),
    columns: game.setting('size'),
    axes: 'east-by-southeast',
    space: Cell
  });

  game.defineActions({
    place: player => action({
      prompt: 'Place your stone',
    }).chooseOnBoard(
      'space', $.hex.all(Space, {player: undefined})
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
          if (game.isConnected(player)) game.finish(player);
        }
      ]
    })
  ));
});
