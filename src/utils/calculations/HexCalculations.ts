import { GameHex, HexType, CubeCoordinates, HexGameGrid, CubeCoordinatesWithValue } from './../../models/HexGrid';
import { Point } from '../../models/Point';

export class HexCalculations {

    private static calculateHexCorner = (hexSize: Point, hexRadius: number, index: number): Point => {
        const angelDeg = 60 * index;
        const angelRad = Math.PI / 180 * angelDeg;
        return {
            x: hexSize.x / 2 + hexRadius * Math.cos(angelRad),
            y: hexSize.y / 2 + hexRadius * Math.sin(angelRad)
        }
    }

    static calculatePixelRadiusByGridWidth = (width: number, gridRadius: number): number => width / (3 * gridRadius - 1);

    static calculateHexCorners = (hexSize: Point, hexRadius: number): Point[] => {
        const corners: Point[] = [];
        for (let i = 0; i < 6; i++) {
            const iCorner = HexCalculations.calculateHexCorner(hexSize, hexRadius, i);
            corners.push(iCorner);
        }
        return corners;
    }

    static calculateHexSizeByHexRadius = (hexRadius: number): Point => ({ x: 2 * hexRadius, y: 2 * Math.sin(Math.PI / 180 * 60) * hexRadius });

    static mapHexCornersToSVGPath = (corners: Point[]): string => corners
        .map((corner: Point, index: number) => index === 0 ? `M${corner.x} ${corner.y}` : `L${corner.x} ${corner.y}`)
        .concat('Z')
        .join(' ');

    static mapCubeToPixelCoordinates = (cube: CubeCoordinates, hexRadius: number, gridRadius: number): Point => (
        {
            x: 3 / 2 * hexRadius * (cube.x + gridRadius - 1),
            y: Math.sqrt(3) * hexRadius * (0.5 * cube.x + (cube.z + gridRadius - 1))
        }
    );

    static generateCubeKey = ({ x, y, z }: CubeCoordinates) => `${x},${y},${z}`;

    static buildHexGrid = (gridRadius: number, hexRadius: number, hexCorners: Point[]): HexGameGrid<GameHex> => {
        const hexGrid = [];
        const indexLimit = gridRadius - 1;
        for (let x = -indexLimit, n = 0; x <= indexLimit; x++) {
            const y0 = Math.max(-indexLimit, -x - indexLimit);
            const yN = Math.min(indexLimit, -x + indexLimit);
            for (let y = y0; y <= yN; y++, n++) {
                const cube: CubeCoordinatesWithValue = { x, y, z: -x - y, value: 0 };
                const pixelCoordinates: Point = HexCalculations.mapCubeToPixelCoordinates(cube, hexRadius, gridRadius);
                const points: string = HexCalculations.mapHexCornersToSVGPath(hexCorners);
                const gridCell: GameHex = {
                    ...cube,
                    left: pixelCoordinates.x,
                    top: pixelCoordinates.y,
                    points,
                    type: HexType.BASE
                };
                hexGrid.push(gridCell);
            }
        }
        return {
            baseGrid: hexGrid,
            filledGrid: new Map()
        };
    }
}