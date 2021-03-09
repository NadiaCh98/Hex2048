import React from 'react';
import { FilledGrid, GameHex } from '../../models/HexGrid';
import { Point } from '../../models/Point';
import { GameStatus } from '../../models/Status';
import Hex from '../Hex/Hex';
import './HexGrid.scss';

interface HexGridProps {
    hexSize: Point;
    hexGrid: FilledGrid<GameHex>;
    status?: GameStatus;
}

const hexGrid: React.FC<HexGridProps> = ({ hexSize, hexGrid, status }) => {
    const classes = ['hex-grid'];
    if (status && status === GameStatus.GAME_OVER) {
        classes.push('_end');
    }
    return (
        <div className={classes.join(' ')}>
            {
                [...hexGrid.entries()].map(([key, value]: [number, GameHex]) => <Hex key={key} hexData={value} hexSize={hexSize} />)
            }
        </div>
    );
}

export default hexGrid;