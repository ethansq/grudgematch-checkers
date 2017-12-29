import React, { Component } from 'react';

const BLACK_PIECE = require("./res/ch-bl-piece.png");
const RED_PIECE = require("./res/ch-r-piece.png");
// const CROWN = require("./res/crown.png");

function Cell(props) {
    var content;

    if (props.value !== null) {
        content =
            <img
                className="piece"
                src={props.value === 'r' ? RED_PIECE : BLACK_PIECE}
                alt="piece" />
    }

    var classNames = ["cell", props.highlight ? "highlight" : "", props.selected ? "selected" : ""];

    return (
        <div className={classNames.join(' ')} onClick={props.onClick}>
            <div className="content">
                <div className="background">
                </div>
                <div className="wrapper center">
                    {props.value !== null ? content : null}
                </div>
            </div>
        </div>
    );
}

function Piece(colour, king) {
    this.colour = colour;
    this.king = king;
}

class Board extends Component {
    constructor(props) {
        super(props);

        var cells = [];
        var b = [8, 1, 17, 10, 3, 19, 12, 5, 21, 14, 7, 23];
        var r = [40, 56, 49, 42, 58, 51, 44, 60, 53, 46, 62, 55];

        for (var i=0; i<64; i++) {
            if (b.indexOf(i) !== -1) {
                cells[i] = new Piece('b', false);
            } else if (r.indexOf(i) !== -1) {
                cells[i] = new Piece('r', false);
            } else {
                cells[i] = null;
            }
        }

        this.state = {
            cells: cells,
            selected: null, // index of selected piece
            auxiliary: [] // options based on the selected piece
        };

        this.renderCell = this.renderCell.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
    }

    renderCell(i) {
        if (this.state.cells[i] === undefined) {
            return;
        }

        var content = this.state.cells[i] !== null ? this.state.cells[i].colour : null;

        return (
            <Cell
                key={"cell-"+i}
                highlight={this.state.auxiliary.indexOf(i) !== -1}
                value={content}
                selected={this.state.selected === i}
                onClick={() => this.handleCellClick(i)} />
        );
    }

    renderRow(i) {
        var cells = [];
        
        for (var j=0; j<8; j++) {
            cells[j] = this.renderCell(i*8 + j);
        }

        return (
            <div key={"row-"+i} className="board-row">
                {cells}
            </div>
        );
    }

    rowsApart(i1, i2) {
        var r1 = Math.floor(i1 / 8);
        var r2 = Math.floor(i2 / 8);
        return Math.abs(r1 - r2);
    }

    /*
    i: the index of the destination for the piece
    */
    handleMove(i) {
        var original = this.state.selected;
        // check for pieces to kill
    }

    handleCellClick(i) {
        // if we're clicking a friendly piece, "select" that piece
        // using 'r' default for now
        if (this.state.cells[i] !== null && this.state.cells[i].colour === 'r') {
            var colour = this.state.cells[i].colour;
            var auxiliary = [i-9, i-18, i-7, i-14, i+7, i+14, i+9, i+18];
            var remove = [];

            // check which auxiliary locations we need to eliminate (no pieces to jump,
            // space is already occupied, etc)
            for (var p=0; p<8; p++) {
                if (auxiliary[p] < 0 || auxiliary[p] > 63) { // space needs to be on the board
                    remove.push(p);
                } else if (this.state.cells[auxiliary[p]] !== null) { // space needs to be empty
                    remove.push(p);
                } else if (p % 2 !== 0 &&
                    (this.state.cells[auxiliary[p-1]] === null // outer cells need a piece to jump over
                        || this.state.cells[auxiliary[p-1]].colour === colour)) { // and we can't eat friendlies
                    remove.push(p);
                } else if (p % 2 === 1 && this.rowsApart(i, auxiliary[p]) !== 2) {
                    remove.push(p);
                } else if (p % 2 === 0 && this.rowsApart(i, auxiliary[p]) !== 1) {
                    remove.push(p);
                }
            }

            var n = remove.length;
            for (var p=0; p<n; p++) {
                auxiliary.splice(remove[p]-p, 1);
            }

            this.setState({
                selected: i,
                auxiliary: auxiliary
            });
        }
        // if we're clicking to move a piece, perform the move
        else if (this.state.auxiliary.indexOf(i) !== -1) {
            handleMove(i);
        }
        // if we're clicking an empty space, de-select
        else {
            this.setState({
                selected: null,
                auxiliary: []
            })
        }
    }

    render() {
        var rows = [];
        for (var i=0; i<8; i++) {
            rows[i] = this.renderRow(i);
        }

        return (
            <div className="board">
                {rows}
            </div>
        );
    }
}

class Checkers extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    render() {
        return (
            <div id="checkers" className="container center">
                <Board />
            </div>
        );
    }
}

export default Checkers;
