import { AxiosResponse } from "axios";
import React from "react";
import { CubeCoordinatesWithValue, FilledGrid, GameHex, HexGameGrid } from "../../models/HexGrid";
import { Point } from "../../models/Point";
import rngServer from '../../axios-rng-server';
import { HexCalculations } from "../../utils/calculations/HexCalculations";
import { GameStatus } from "../../models/Status";
import { GameCalculations } from "../../utils/calculations/GameCalculations";
import { Directions } from "../../models/Directions";
import './Layout.scss';
import Toolbar from "../../components/Toolbar/Toolbar";
import HexGrid from "../../components/HexGrid/HexGrid";

interface LayoutState {
    layoutWidth: number;
    radius: number;
    minRadius: number;
    maxRadius: number;
    hexSize: Point;
    gameGrid: HexGameGrid<GameHex>;
    status: GameStatus
}

const INIT_GAMEGRID: HexGameGrid<GameHex> = {
    baseGrid: [],
    filledGrid: new Map()
}

class Layout extends React.Component<{}, LayoutState> {

    state: LayoutState = {
        layoutWidth: 650,
        minRadius: 2,
        maxRadius: 20,
        radius: 2,
        gameGrid: { ...INIT_GAMEGRID },
        status: GameStatus.PLAYING,
        hexSize: {
            x: 0,
            y: 0
        }
    }

    changeStatus = (isActiveGame: boolean) => {
        this.setState({ status: isActiveGame ? GameStatus.PLAYING : GameStatus.GAME_OVER });
    }

    getGameRadiusFromLocationHash = (minRadius: number, maxRadius: number) => {
        const localHash = window.location.hash;
        if (localHash) {
            const foundRadius = localHash.match(/\d*$/)?.join('');
            const parseRadius = !!foundRadius ? parseInt(foundRadius) : null;
            return !!parseRadius && parseRadius >= minRadius && parseRadius <= maxRadius ? parseRadius : null;
        }
        return null;
    }

    getNewGridCellsFromServer = async (gameRadius: number, filledCells: CubeCoordinatesWithValue[]): Promise<CubeCoordinatesWithValue[]> =>
        await rngServer.post(`/${gameRadius}`, filledCells)
            .then((response: AxiosResponse<CubeCoordinatesWithValue[]>) => response.data);

    updateGameGridByFiiledCells = async (gameRadius: number, filledCells: CubeCoordinatesWithValue[], gameGrid: HexGameGrid<GameHex>) => {
        const newCells = await this.getNewGridCellsFromServer(gameRadius, filledCells);
        const updatedGameGrid = GameCalculations.updatedGameGridByNewCells(newCells, gameGrid);
        const gameStatus = GameCalculations.isActiveGame(updatedGameGrid);
        this.changeStatus(gameStatus);
        this.setState({ gameGrid: updatedGameGrid });
    }

    initNewGame = async (gameRadius: number) => {
        const hexRadius: number = HexCalculations.calculatePixelRadiusByGridWidth(this.state.layoutWidth, gameRadius);
        const hexSize: Point = HexCalculations.calculateHexSizeByHexRadius(hexRadius);
        const hexCorners: Point[] = HexCalculations.calculateHexCorners(hexSize, hexRadius);
        const gameGrid = HexCalculations.buildHexGrid(gameRadius, hexRadius, hexCorners);
        this.setState(
            { radius: gameRadius, gameGrid, hexSize },
            () => this.updateGameGridByFiiledCells(gameRadius, [], gameGrid));
    }

    makeStep = async ({ key }: KeyboardEvent) => {
        if (Object.values(Directions).includes(key as Directions) && this.state.status === GameStatus.PLAYING) {
            const { data, isChanged } = GameCalculations.play(key as Directions, this.state.gameGrid);
            this.setState({ gameGrid: data });
            if (isChanged) {
                this.updateGameGridByFiiledCells(this.state.radius, [...data.filledGrid.values()], data);
            }
        }
    }

    changeGameSize = (value: number) => {
        if (this.state.minRadius <= value && value <= this.state.maxRadius) {
            this.setState(
                {
                    radius: value, status: GameStatus.PLAYING, gameGrid: { ...INIT_GAMEGRID }
                }, () => this.initNewGame(value));
        }
    }

    componentDidMount() {
        const gameRadius = this.getGameRadiusFromLocationHash(this.state.minRadius, this.state.maxRadius) || this.state.radius;
        document.addEventListener('keydown', this.makeStep);
        this.initNewGame(gameRadius);
    }

    render() {
        const baseGrid: FilledGrid<GameHex> = new Map(this.state.gameGrid.baseGrid.map((cell, index) => [index, cell]));
        return (
            <div className="layout" style={{ width: this.state.layoutWidth }}>
                <Toolbar minValue={this.state.minRadius} maxValue={this.state.maxRadius}
                    currentValue={this.state.radius} changeValue={(value) => this.changeGameSize(value)} />
                <div>
                    <HexGrid hexGrid={baseGrid} hexSize={this.state.hexSize} />
                    <HexGrid hexGrid={this.state.gameGrid.filledGrid} hexSize={this.state.hexSize} status={this.state.status} />
                </div>
                <div data-status={this.state.status} />
            </div>
        )
    }
}

export default Layout;