import React from 'react';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import Login from './login';
import Lobby from './lobby';
import Board from './board';
import registerServiceWorker from './registerServiceWorker';
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

require('./scss/base.scss');

class Game extends Component {
	constructor(props) {
		super(props);

		this.state = {
			stage: 'login', // 'lobby', 'board'

		}

        this.handleLoginComplete = this.handleLoginComplete.bind(this);
        this.handleLobbyComplete = this.handleLobbyComplete.bind(this);
	}

	getComponent() {
		if (this.state.stage === 'login') {
			return (
				<Login onComplete={this.handleLoginComplete} />
			);
		} else if (this.state.stage === 'lobby') {
			return (
				<Lobby onComplete={this.handleLobbyComplete} />
			);
		} else if (this.state.stage === 'board') {
			return (
				<Board />
			);
		}
	}

	handleLoginComplete() {
		this.setState({
			stage: 'lobby'
		});
	}

	handleLobbyComplete() {
		this.setState({
			stage: 'board'
		});
	}

	render() {
		return (
			<ReactCSSTransitionGroup
			    transitionName='slide'
			    transitionEnterTimeout={1000}
			    transitionLeaveTimeout={1000}
			    component='div'>

			    <div key={this.state.stage}>{this.getComponent()}</div>
			</ReactCSSTransitionGroup>
		);
	}
}

ReactDOM.render(
	<Game />,
	document.getElementById('root')
);

registerServiceWorker();
