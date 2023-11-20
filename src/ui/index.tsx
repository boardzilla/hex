import React from 'react';
import { render, numberSetting } from '@boardzilla/core';
import { default as setup, Cell } from '../game/index.js';

import './style.scss';

render(setup, {
  settings: {
    size: numberSetting('Grid size', 3, 19),
  },
  layout: board => {
    board.appearance({
      render: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1027.517"
          height="634.064"
          version="1.1"
          viewBox="0 0 1027.517 634.064"
        >
          <g
            fillOpacity="1"
            stroke="#0d0d0d"
            strokeWidth="5"
            strokeOpacity="1"
            strokeLinejoin="round"
            transform="translate(-7.197 -1.04)"
          >
            <path
              fill={board.players[0]?.color}
              d="M9.242 26.955L50.83 1.54h654.628l328.084 559.13.16 48.778-44.058 25.156H338.096L7.702 76.244z"
            ></path>
            <path
              fill={board.players[1]?.color}
              d="M9.242 26.955L50.83 1.54h654.628l-183.59 318.175 511.835 289.733-44.06 25.156H338.097l184.115-315.987z"
            ></path>
          </g>
        </svg>
      )
    });

    board.layout(Cell, {
      margin: 2,
      aspectRatio: .866,
      offsetRow: {x: 95, y: 0},
      offsetColumn: {x: 47.835, y: 70}
    })
    board.all(Cell).appearance({
      render: cell => <div><div style={{ backgroundColor: cell.player?.color }}/></div>
    });
  }
});
