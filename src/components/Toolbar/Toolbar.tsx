import React from 'react';
import './Toolbar.scss';

interface ToolbarProps {
    currentValue: number;
    minValue: number;
    maxValue: number;
    changeValue: (value: number) => void;
}

const toolbar: React.FC<ToolbarProps> = ({ currentValue, minValue, maxValue, changeValue }) =>
    <header className="toolbar">
        <p className="toolbar__caption">Game Size</p>
        <input className="toolbar__slider" id="radius" type="range"
            min={minValue} max={maxValue} value={currentValue}
            onChange={event => changeValue(Number(event.target.value))} />
        <label htmlFor="radius">Radius: {currentValue}</label>
    </header>

export default toolbar;