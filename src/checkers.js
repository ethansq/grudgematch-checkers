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

/*
Each piece has a colour and a king status, which allows it to move backwards
*/
function Piece(colour, king) {
    this.colour = colour;
    this.king = king;
}

class Board extends Component {
    constructor(props) {
        super(props);

        // default board with starting positions
        var cells = [];
        // var b = [8, 1, 17, 10, 3, 19, 12, 5, 21, 14, 7, 23];
        // var r = [40, 56, 49, 42, 58, 51, 44, 60, 53, 46, 62, 55];
        var b = [26, 28, 12, 14]; // @TEST
        var r = [35, 37]; // @TEST

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
            auxiliary: [], // options based on the selected piece
            active: null,
            ongoing: true
        };

        // bindings
        this.renderCell = this.renderCell.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleSelectCell = this.handleSelectCell.bind(this);
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

    /*
    Helper to determine how many rows apart two cells are. This helps us maintain
    structure of moves (diagonal only)
    */
    rowsApart(i1, i2) {
        var r1 = Math.floor(i1 / 8);
        var r2 = Math.floor(i2 / 8);
        return Math.abs(r1 - r2);
    }

    handleSelectCell(i) {
        console.log(this.state.cells);
        var colour = this.state.cells[i].colour;
        var auxiliary = [i-9, i-18, i-7, i-14, i+7, i+14, i+9, i+18];

        // check which auxiliary locations we need to eliminate (no pieces to jump,
        // space is already occupied, etc)
        var _auxiliary = auxiliary.map((ele, index) => {
            // turn is over
            if (!this.state.ongoing) {
                return -1;
            }
            // turn is still ongoing, but a piece is 'active'
            else if (this.state.active !== null) {
                // must be within bounds
                if (ele < 0 || ele > 63) {
                    return -1;
                }
                // while active, inner moves are not allowed
                else if (index % 2 === 0) {
                    return -1;
                } else {
                    if (this.state.cells[auxiliary[index-1]] === null || // if no piece to kill, cannot move to this dest
                            this.state.cells[auxiliary[index-1]].colour === colour) { // cannot kill friendlies
                        return -1;
                    }
                    // unless this piece is a king, can only kill forwards
                    else if (((colour === 'r' && ele > i) && !this.state.cells[i].king)
                        || ((colour === 'b' && ele < i) && !this.state.cells[i].king)) {
                        return -1;
                    }
                    return ele;
                }
            } else if (false
                // our rules chart for determining whether a cell is a valid destination
                // or not
                || (ele < 0 || ele > 63) // space needs to be on the board
                || (this.state.cells[ele] !== null) // space needs to be empty
                || (index % 2 !== 0 &&
                        (this.state.cells[auxiliary[index-1]] === null || // outer cells need a piece to jump over
                            this.state.cells[auxiliary[index-1]].colour === colour) // and we can't eat friendlies
                        )
                || (index % 2 === 1 && this.rowsApart(i, ele) !== 2)
                || (index % 2 === 0 && this.rowsApart(i, ele) !== 1)
                || ((colour === 'r' && ele > i) && !this.state.cells[i].king) // non-kings cannot move backwards
                || ((colour === 'b' && ele < i) && !this.state.cells[i].king)
            ) {
                return -1;
            }
            return ele;
        });

        this.setState({
            selected: i,
            auxiliary: _auxiliary
        });
    }

    /*
    i: the index of the destination for the piece. Players can only click a cell to
    trigger handleMove() if the cell is an auxiliary cell. This means we don't
    have to check if the cell is actually empty, etc.
    */
    handleMove(i) {
        var _from = this.state.selected;
        var _dest = i;

        const inner = [-9, -7, 7, 9];
        const outer = [-18, -14, 14, 18];

        // if dest is an outer cell, remove the killed piece
        if (outer.indexOf(_dest - _from) !== -1) {
            this.state.cells[_from + inner[outer.indexOf(_dest - _from)]] = null;
        }

        // copy the board
        var cells = this.state.cells.slice();
        // if dest is inner cell, cannot make further moves
        var normal = inner.indexOf(_dest - _from) !== -1;
        // if the piece has reached the end of the board, promote to king
        var promote =
            (this.state.cells[_from].colour === 'r' && _dest < 8) ||
                (this.state.cells[_from].colour === 'b' && _dest > 55);

        cells[_dest] = cells[_from]; // move piece
        cells[_from] = null; // delete piece from old position
        cells[_dest].king = promote;


        this.setState(
            {
                // update cells
                cells: cells,
                // piece is now active. Only this piece can move, and any subsequent
                // moves must be kills
                active: _dest,
                // if it was a normal move, turn is over
                ongoing: !normal
            },
            () => { // once state is updated, also update the current selection
                this.handleSelectCell(_dest);
            }
        );
    }

    handleCellClick(i) {
        // if we're clicking to move a piece, perform the move
        if (this.state.auxiliary.indexOf(i) !== -1) {
            this.handleMove(i);
        }
        // if we have an active piece, then we can only show subsequent kill-moves
        // for that active piece
        // do not allow de-selection
        else if (this.state.active !== null) {
            return;
        }
        // if we're clicking a friendly piece, "select" that piece
        // using 'r' default for now
        else if (this.state.cells[i] !== null && this.state.cells[i].colour === 'r') {
            this.handleSelectCell(i);
        }
        // if we're clicking an empty space, de-select
        else {
            this.setState({
                selected: null,
                auxiliary: [],
                active: null
            });
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
