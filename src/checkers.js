import React, { Component } from 'react';
import * as firebase from 'firebase';

var FontAwesome = require('react-fontawesome');

const BLACK_PIECE = require("./res/ch-bl.png");
const RED_PIECE = require("./res/ch-r.png");
const BLACK_KING = require("./res/ch-bl-k.png");
const RED_KING = require("./res/ch-r-k.png");

const VICTORY = require("./res/victory.png");
const DEFEAT = require("./res/defeat.png");
const BLANK = require("./res/blank.png");

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

        this.props.toggleProgressBar(); // force hide

        var title = "Room ";
        title = title.concat(this.props.roomId);
        this.props.setToolbarTitle(title);

        this.state = {
            turn: 'r',
            dead: [], // helper array to keep track of how many to show in the dead pile
            cells: [],
            selected: null, // index of selected piece
            auxiliary: [], // options based on the selected piece
            active: null,
            ongoing: true,
            history: [],
            timestamp: -1, // timestamp of latest update
            gameOver: ''
        };

        // bindings
        this.renderCell = this.renderCell.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleSelectCell = this.handleSelectCell.bind(this);
        this.handleTurnEnd = this.handleTurnEnd.bind(this);
        this.handleUndo = this.handleUndo.bind(this);
        this.buildAuxiliaryCells = this.buildAuxiliaryCells.bind(this);
        this.checkWinner = this.checkWinner.bind(this);
    }

    componentWillMount() {
        // Fetch the board from Firebase
        var db = firebase.database().ref();
        var ref = db.child('rooms').child(this.props.roomId).child('state');

        // the listener will also trigger for the same user that
        // made the move, so prevent it by checking a timestamp
        ref.on('value', (snapshot) => {
            this.setState(snapshot.val(), () => {
                this.props.toggleProgressBar(true); // force hide

                if (this.state.gameOver !== '') {
                    this.props.showGameOverModal(this.state.gameOver === this.props.role);
                    console.log(this.state.gameOver === this.props.role);
                } else {
                    var waiting = "Waiting on opponent...";
                    var proceed = "Your turn. You are ";
                    proceed = proceed.concat(this.props.role === 'r' ? "red." : "black.");
                    var message = snapshot.val().turn !== this.props.role ? waiting : proceed;
                    var type = snapshot.val().turn !== this.props.role ? "waiting" : "proceed";
                    this.props.toggleStatusMessage(message, true, type);
                }
            });
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

    /*
    i: the index of the cell we're currently considering
    */
    buildAuxiliaryCells(i) {
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
                if (false
                    || ele < 0 || ele > 63 // must be within bounds
                    || index % 2 === 0 // while active, inner moves (non-kills) are not allowed
                    || this.state.cells[ele] !== -1 // dest needs to be empty
                    || this.state.cells[auxiliary[index-1]] === -1 // if no piece to kill in between, cannot move to outer cell
                    || this.state.cells[auxiliary[index-1]].colour === colour // cannot kill friendlies
                    || (colour === 'r' && ele > i && !this.state.cells[i].king) // only kings can move backwards
                    || (colour === 'bl' && ele < i && !this.state.cells[i].king)
                    || (index % 2 === 1 && this.rowsApart(i, ele) !== 2) // must maintain diagonal move structure
                ) {
                    return -1;
                } else {
                    return ele;
                }
            } else if (false
                // our rules chart for determining whether a cell is a valid destination
                // or not
                || ele < 0 || ele > 63 // space needs to be on the board
                || this.state.cells[ele] !== -1 // space needs to be empty
                || (index % 2 !== 0 &&
                        (this.state.cells[auxiliary[index-1]] === -1 || // outer cells need a piece to jump over
                            this.state.cells[auxiliary[index-1]].colour === colour)) // and we can't eat friendlies
                || (index % 2 === 1 && this.rowsApart(i, ele) !== 2) // must maintain diagonal move structure
                || (index % 2 === 0 && this.rowsApart(i, ele) !== 1)
                || (colour === 'r' && ele > i && !this.state.cells[i].king) // non-kings cannot move backwards
                || (colour === 'bl' && ele < i && !this.state.cells[i].king)
            ) {
                return -1;
            }
            return ele; // default
        });

        return _auxiliary;
    }

    handleSelectCell(i) {
        var _auxiliary = this.buildAuxiliaryCells(i);

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

        // deep-copy our cells array
        var _cells = this.state.cells.map((ele, i) => {
            if (ele === -1) {
                return ele;
            } else {
                return ({
                    colour: ele.colour,
                    king: ele.king
                });
            }
        });

        // store our move in local history (this doesn't get pushed up to Firebase) 
        _history.push({
            active: this.state.active,
            auxiliary: this.state.auxiliary,
            cells: _cells,
            ongoing: this.state.ongoing,
            selected: this.state.selected,
            dead: this.state.dead,
            timestamp: this.state.timestamp
        });

        var _from = this.state.selected;
        var _dest = i;

        const inner = [-9, -7, 7, 9];
        const outer = [-18, -14, 14, 18];

        // if dest is an outer cell, remove the killed piece
        if (outer.indexOf(_dest - _from) !== -1) {
            var piece = this.state.cells[_from + inner[outer.indexOf(_dest - _from)]].colour;
            piece = piece.concat(this.state.cells[_from + inner[outer.indexOf(_dest - _from)]].king ? 'k' : '');
            var _dead = this.state.dead.slice();
            _dead.push(piece);
            this.setState({dead: _dead});

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
        // can only select friendly pieces (our current role)
        else if (this.state.cells[i] !== -1
            && this.state.cells[i].colour === this.state.turn
            && this.state.cells[i].colour === this.props.role) {

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

            this.setState(
            {
                selected: null,
                auxiliary: [],
                active: null,
                ongoing: true,
                turn: this.state.turn === 'r' ? 'bl' : 'r',
                history: [],
                moves: 0,
                timestamp: Date.now(),
                gameOver: this.checkWinner()
            },
            // update Firebase board state
            () => {
                db.child('rooms').child(this.props.roomId).child('state').set(this.state)
                .then(() => {
                    if (this.state.gameOver === this.props.role) {
                        this.props.toggleStatusMessage('', false, '');
                        this.props.showGameOverModal(true);
                    } else {
                        var message = "Waiting on opponent...";
                        this.props.toggleStatusMessage(message, true, 'waiting');
                    }
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
                selected: history.selected,
                dead: history.dead,
                timestamp: history.timestamp
            });
        }
    }

    /*
    There are two ways to win: either your opponent has lost all their pieces,
    or your opponent can make no possible moves
    */
    checkWinner() {
        /*
        check if opponent has any more pieces. The current player cannot lose
        a piece after their own move, so we don't need to bother checking
        for a win, only for a win.
        */
        // check each cell for an opponent piece
        var opponents = [];
        for (var i=0; i<63; i++) {
            if (this.state.cells[i] !== -1 && this.state.cells[i].colour !== this.props.role) {
                opponents.push(i); // save this piece
            }
        }

        var n = opponents.length;
        if (n === 0) return this.props.role; // no opponent pieces left

        /*
        checking if the opponent has no possible moves to make is a little more
        difficult, but we can use auxiliary cells for each element found from
        the previous step
        */
        // if there are opponent pieces, build auxiliary cells array for each, and see
        // if any has a valid cell to move to. If so, haven't won yet
        var index;
        var _auxiliary;
        for (var i=0; i<n; i++) {
            index = opponents[i];
            _auxiliary = this.buildAuxiliaryCells(index);

            for (var j=0; j<8; j++) {
                if (_auxiliary[j] !== -1) {
                    return ''; // if any auxiliary cells are valid destinations, then haven't won yet
                }
            }
        }

        return this.props.role;
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
            if (e.charAt(0) === 'r') {
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
            <div className="wrapper center">
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
            showStatusMessage: false,
            statusMessage: ''
        }

        this.toggleStatusMessage = this.toggleStatusMessage.bind(this);
        this.showGameOverModal = this.showGameOverModal.bind(this);
    }

    toggleStatusMessage(message, show, type) {
        if (show) {
            this.setState({
                statusMessage: message,
                showStatusMessage: true,
                statusType: type,
                gameOverModal: ''
            });
        } else {
            this.setState({showStatusMessage: false});
        }
    }

    showGameOverModal(status) {
        console.log("status");
        console.log(status);
        this.setState({
            gameOverModal: status ? "victory" : "defeat"
        });
    }

    render() {
        var showStatusMessage = this.state.showStatusMessage ? "" : "hidden";
        var statusClasses = ["status", showStatusMessage, this.state.statusType];

        var modalVisibility = this.state.gameOverModal === '' ? "hidden" : "";

        return (
            <div id="checkers" className="container">
                <div className={modalVisibility+" modal"}>
                    <div className="background"></div>
                    <div className="img center">
                        <img
                            className={this.state.gameOverModal+" center"}
                            src=
                            {
                                this.state.gameOverModal === 'victory'
                                    ? VICTORY
                                    : (this.state.gameOverModal === 'defeat' ? DEFEAT : BLANK)
                            }
                            alt="modal" />
                    </div>
                </div>
                
                <Board
                    showGameOverModal={this.showGameOverModal}
                    setToolbarTitle={this.props.setToolbarTitle}
                    toggleStatusMessage={this.toggleStatusMessage}
                    role={this.props.role}
                    roomId={this.props.roomId}
                    toggleProgressBar={this.props.toggleProgressBar} />

                <div className={statusClasses.join(' ')}>
                    <div className="shimmer">
                        {this.state.statusMessage}
                    </div>
                </div>
            </div>
        );
    }
}

export default Checkers;
