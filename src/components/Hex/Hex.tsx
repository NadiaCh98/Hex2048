import React, { CSSProperties } from "react";
import { GameHex, HexType } from "../../models/HexGrid";
import { Point } from "../../models/Point";
import './Hex.scss';

interface HexCellProps {
    hexSize: Point;
    hexData: GameHex;
}

const HexCell: React.FC<HexCellProps> = ({ hexSize, hexData }) => {
    const valueClass = `_value _value-${hexData.value}`;
    const hexClass = ['hex', valueClass].join(' ');
    const hexStyle: CSSProperties = {
        position: 'absolute',
        left: hexData.left,
        top: hexData.top
    }
    const hex = hexData.type === HexType.BASE
        ? (
            <div data-x={hexData.x} data-y={hexData.y} data-z={hexData.z} data-value={hexData.value} style={hexStyle}>
                <svg width={hexSize.x} height={hexSize.y}>
                    <path className="hex" d={hexData.points} />
                </svg>
            </div>
        )
        : (
            <div style={hexStyle} className="wrapper">
                <svg width={hexSize.x} height={hexSize.y}>
                    <g className={hexClass}>
                        <path d={hexData.points} />
                        <text x="50%" y="50%" fontSize={`${hexSize.x / 4}px`}
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {hexData.value || ''}
                        </text>
                    </g>
                </svg>
            </div>
        )
    return hex;
}

export default HexCell;