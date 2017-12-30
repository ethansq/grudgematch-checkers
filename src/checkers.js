import React, { Component } from 'react';
import * as firebase from 'firebase';

var FontAwesome = require('react-fontawesome');

const BLACK_PIECE = require("./res/ch-bl-piece.png");
const RED_PIECE = require("./res/ch-r-piece.png");
const BLACK_KING = require("./res/ch-bl-king-piece.png");
const RED_KING = require("./res/ch-r-king-piece.png");

function Cell(props) {
    var content;

    if (props.value !== null) {
        content =
            <img
                className="piece"
                src={
                    props.value === 'r'
                        ? (props.king ? RED_KING : RED_PIECE)
                        : (props.king ? BLACK_KING : BLACK_PIECE)
                }
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

class Board extends Component {
    constructor(props) {
        super(props);

        this.state = {
            turn: 'r',
            // @TEST
            dead: [], // helper array to keep track of how many to show in the dead pile
            cells: [],
            selected: null, // index of selected piece
            auxiliary: [], // options based on the selected piece
            active: null,
            ongoing: true,
            history: []
        };

        // bindings
        this.renderCell = this.renderCell.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleSelectCell = this.handleSelectCell.bind(this);
        this.handleTurnEnd = this.handleTurnEnd.bind(this);
        this.handleUndo = this.handleUndo.bind(this);

        this.props.toggleProgressBar();
    }

    componentWillMount() {
        // Fetch the board from Firebase
        var db = firebase.database().ref();
        db.child('rooms').child(this.props.roomId).child('state').once('value', (snapshot) => {
            this.setState(snapshot.val(), () => {
                console.log(this.state);
            });
            this.props.toggleProgressBar();
        });
    }

    renderCell(i) {
        if (this.state.cells[i] === undefined) {
            return;
        }

        return (
            <Cell
                key={"cell-"+i}
                highlight={this.state.auxiliary.indexOf(i) !== -1}
                value={this.state.cells[i] !== -1 ? this.state.cells[i].colour : null}
                king={this.state.cells[i] !== -1 ?this.state.cells[i].king : null}
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
                    if (this.state.cells[auxiliary[index-1]] === -1 || // if no piece to kill, cannot move to this dest
                            this.state.cells[auxiliary[index-1]].colour === colour) { // cannot kill friendlies
                        return -1;
                    }
                    // unless this piece is a king, can only kill forwards
                    else if (((colour === 'r' && ele > i) && !this.state.cells[i].king)
                        || ((colour === 'bl' && ele < i) && !this.state.cells[i].king)) {
                        return -1;
                    }
                    return ele;
                }
            } else if (false
                // our rules chart for determining whether a cell is a valid destination
                // or not
                || (ele < 0 || ele > 63) // space needs to be on the board
                || (this.state.cells[ele] !== -1) // space needs to be empty
                || (index % 2 !== 0 &&
                        (this.state.cells[auxiliary[index-1]] === -1 || // outer cells need a piece to jump over
                            this.state.cells[auxiliary[index-1]].colour === colour) // and we can't eat friendlies
                        )
                || (index % 2 === 1 && this.rowsApart(i, ele) !== 2)
                || (index % 2 === 0 && this.rowsApart(i, ele) !== 1)
                || ((colour === 'r' && ele > i) && !this.state.cells[i].king) // non-kings cannot move backwards
                || ((colour === 'bl' && ele < i) && !this.state.cells[i].king)
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
        var _history = this.state.history.slice();
        _history.push({
            active: this.state.active,
            auxiliary: this.state.auxiliary,
            cells: this.state.cells.slice(),
            ongoing: this.state.ongoing,
            selected: this.state.selected,
            // turn: this.state.turn
        });

        var _from = this.state.selected;
        var _dest = i;

        const inner = [-9, -7, 7, 9];
        const outer = [-18, -14, 14, 18];

        // if dest is an outer cell, remove the killed piece
        if (outer.indexOf(_dest - _from) !== -1) {
            var piece = this.state.cells[_from + inner[outer.indexOf(_dest - _from)]].colour;
            piece = piece + this.state.cells[_from + inner[outer.indexOf(_dest - _from)]].king ? 'k' : '';
            this.state.dead.push(piece);

            this.state.cells[_from + inner[outer.indexOf(_dest - _from)]] = -1;
        }

        // copy the board
        var cells = this.state.cells.slice();
        // if dest is inner cell, cannot make further moves
        var normal = inner.indexOf(_dest - _from) !== -1;
        // if the piece has reached the end of the board, promote to king
        var promote =
            (this.state.cells[_from].colour === 'r' && _dest < 8) ||
                (this.state.cells[_from].colour === 'bl' && _dest > 55);

        cells[_dest] = cells[_from]; // move piece
        cells[_from] = -1; // delete piece from old position
        cells[_dest].king = promote ? true : cells[_dest].king;

        this.setState(
            {
                // update cells
                cells: cells,
                // piece is now active. Only this piece can move, and any subsequent
                // moves must be kills
                active: _dest,
                // if it was a normal move, turn is over
                ongoing: !normal,
                // set our updated history list
                history: _history
            },
            () => { // once state is updated, also update the current selected piece/cell
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
        else if (this.state.cells[i] !== -1 && this.state.cells[i].colour === this.state.turn) {
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

    /*
    Can only end turn if a piece has made a move (cannot pass)
    Also, once a turn is locked in, can no longer undo
    */
    handleTurnEnd() {
        // Can only end turn if a piece has made a move (cannot pass)
        // Also
        if (this.state.active) {
            var db = firebase.database().ref();

            this.props.toggleProgressBar();

            this.setState(
            {
                selected: null,
                auxiliary: [],
                active: null,
                ongoing: true,
                turn: this.state.turn === 'r' ? 'bl' : 'r',
                history: [],
                moves: 0
            },
            // update Firebase board state
            () => {
                db.child('rooms').child(this.props.roomId).child('state').set(this.state)
                .then(() => {
                    console.log("State pushed");
                    this.props.toggleProgressBar();
                });
            });
        }
    }

    /*
    Pop a state from our history list and apply it to our current state
    */
    handleUndo() {
        if (this.state.history.length > 0) {
            var history = this.state.history.pop();
            this.setState({
                active: history.active,
                auxiliary: history.auxiliary,
                cells: history.cells.slice(),
                ongoing: history.ongoing,
                selected: history.selected
            });
        }
    }

    render() {
        // initialize our rows
        var rows = [];
        for (var i=0; i<8; i++) {
            rows[i] = this.renderRow(i);
        }

        // initialize our dead piles
        var blDead = [];
        var rDead = [];
        this.state.dead.map((e, i) => {
            if (e === 'r' || e === 'rk') {
                rDead.push(
                    <div key={i} className="wrapper">
                        <img
                            className="dead-piece"
                            src={e === 'rk' ? RED_KING : RED_PIECE}
                            alt="piece" />
                    </div>
                );
            } else {
                blDead.push(
                    <div key={i} className="wrapper">
                        <img
                            className="dead-piece"
                            src={e === 'blk' ? BLACK_KING : BLACK_PIECE}
                            alt="piece" />
                    </div>
                );
            }
        });

        return (
            <div className="wrapper">
                <div className="w90">
                    <div className="board-section">
                        <div className="bl-dead">{blDead}</div>
                        <div className="board">
                            {rows}
                        </div>
                        <div className="r-dead">{rDead}</div>
                    </div>
                </div>
                <div className="buttons">
                    <div
                        className={"btn undo "+(this.state.history.length > 0 ? "" : "disabled")}
                        onClick={this.handleUndo}>
                        <div className="center"><FontAwesome
                            name='undo'
                            size='2x'
                            inverse/></div>
                    </div>
                    <div
                        className={"btn done "+(this.state.active ? "" : "disabled")}
                        onClick={this.handleTurnEnd}>
                        <div className="center"><FontAwesome
                            name='check-circle'
                            size='2x'
                            inverse/></div>
                    </div>
                </div>
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
                <Board
                    roomId={this.props.roomId}
                    toggleProgressBar={this.props.toggleProgressBar} />
            </div>
        );
    }
}

export default Checkers;
