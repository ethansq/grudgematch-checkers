import React, { Component } from 'react';
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

/*
*/
class Board extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    render() {
        return (
            <ReactCSSTransitionGroup transitionName = "fade"
                transitionAppear = {true} transitionAppearTimeout = {777}
                transitionLeave = {false} transitionEnter = {false}>
                
        	   <div>BOARD COMPONENT</div>
            </ReactCSSTransitionGroup>
        );
    }
}

export default Board;
