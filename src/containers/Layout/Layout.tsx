import axios, { AxiosResponse } from "axios";
import React from "react";
import { CubeCoordinatesWithValue, FilledGrid, GameHex, HexGameGrid } from "../../models/HexGrid";
import { Point } from "../../models/Point";
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
    status: GameStatus;
    serverUrl?: string;
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
        },
        serverUrl: process.env.REACT_APP_REMOTE_SERVER_URL
    }

    changeStatus = (isActiveGame: boolean) => {
        this.setState({ status: isActiveGame ? GameStatus.PLAYING : GameStatus.GAME_OVER });
    }

    getGameRadiusFromLocationHash = (hash: string, minRadius: number, maxRadius: number): number => {
        const foundRadius = hash.match(/\d*$/)?.join('');
        const parseRadius = !!foundRadius ? parseInt(foundRadius) : null;
        return !!parseRadius && parseRadius >= minRadius && parseRadius <= maxRadius ? parseRadius : 0;
    }

    getNewGridCellsFromServer = async (gameRadius: number, filledCells: CubeCoordinatesWithValue[]): Promise<CubeCoordinatesWithValue[]> =>
        await axios.post(`${this.state.serverUrl}/${gameRadius}`, filledCells)
            .then((response: AxiosResponse<CubeCoordinatesWithValue[]>) => response.data);

    updateGameGridByFiiledCells = async (gameRadius: number, filledCells: CubeCoordinatesWithValue[], gameGrid: HexGameGrid<GameHex>) => {
        const newCells = await this.getNewGridCellsFromServer(gameRadius, filledCells);
        const updatedGameGrid = GameCalculations.updatedGameGridByNewCells(newCells, gameGrid);
        const gameStatus = GameCalculations.isActiveGame(updatedGameGrid);
        this.changeStatus(gameStatus);
        this.setState({ gameGrid: updatedGameGrid });
    }

    initNewGame = async (gameRadius: number, serverUrl?: string) => {
        const hexRadius: number = HexCalculations.calculatePixelRadiusByGridWidth(this.state.layoutWidth, gameRadius);
        const hexSize: Point = HexCalculations.calculateHexSizeByHexRadius(hexRadius);
        const hexCorners: Point[] = HexCalculations.calculateHexCorners(hexSize, hexRadius);
        const gameGrid = HexCalculations.buildHexGrid(gameRadius, hexRadius, hexCorners);
        this.setState(
            { radius: gameRadius, gameGrid, hexSize, status: GameStatus.PLAYING, serverUrl: serverUrl || this.state.serverUrl },
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
                    radius: value, gameGrid: { ...INIT_GAMEGRID }
                },
                () => this.initNewGame(value)
            );
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.makeStep);
        const localHash = window.location.hash;
        const gameRadius = localHash
            ? this.getGameRadiusFromLocationHash(localHash, this.state.minRadius, this.state.maxRadius)
            : this.state.radius;
        const serverUrl = localHash && process.env.REACT_APP_LOCALHOST_SERVER_URL;
        this.initNewGame(gameRadius, serverUrl);
    }

    render() {
        const baseGrid: FilledGrid<GameHex> = new Map(this.state.gameGrid.baseGrid.map((cell, index) => [index, cell]));
        return (
            <div className="layout" style={{ width: this.state.layoutWidth }}>
                <select id="url-server"
                    value={this.state.serverUrl}
                    onChange={event => this.initNewGame(this.state.radius, event.target.value)}
                >
                    <option id="remote" value={process.env.REACT_APP_REMOTE_SERVER_URL}>Remote server</option>
                    <option id="localhost" value={process.env.REACT_APP_LOCALHOST_SERVER_URL}>Local server</option>
                </select>
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