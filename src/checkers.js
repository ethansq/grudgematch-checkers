import React, { Component } from 'react';

class Cell extends Component {
    render() {
        return (
            <div className="cell">
                <div className="content">
                    <div className="wrapper center">
                        {this.props.value}
                    </div>
                </div>
            </div>
        );
    }
}

class Board extends Component {
    constructor(props) {
        super(props);
    }

    renderCell(i) {
        return (
            <Cell key={"cell-"+i} value={i} />
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

    render() {
        var rows = [];
        // Checkers boards are 8 by 8
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
