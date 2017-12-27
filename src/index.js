import React from 'react';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import Login from './login';
import ChooseName from './choose-name';
import Lobby from './lobby';
import Board from './board';
import registerServiceWorker from './registerServiceWorker';
import * as firebase from 'firebase';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

const firebaseConfig = require('./firebase.json');
firebase.initializeApp(firebaseConfig);

require('./scss/base.scss');

class Game extends Component {
	constructor(props) {
		super(props);

		this.state = {
			stage: 'login', // 'lobby', 'board'
		}

        this.handleLoginComplete = this.handleLoginComplete.bind(this);
        this.handleLobbyComplete = this.handleLobbyComplete.bind(this);
        this.handleChooseNameComplete = this.handleChooseNameComplete.bind(this);
	}

	getComponent() {
		if (this.state.stage === 'login') {
			return (
				<Login onComplete={this.handleLoginComplete} />
			);
		} else if (this.state.stage === 'choose-name') {
			return (
				<ChooseName onComplete={this.handleChooseNameComplete} />
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

	handleChooseNameComplete() {
		this.setState({
			stage: 'lobby'
		});
	}

	handleLoginComplete(createdNewUser) {
		this.setState({
			stage: createdNewUser ? 'choose-name' : 'lobby'
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
			    transitionEnterTimeout={400}
			    transitionLeaveTimeout={400}
			    component='div'>

			    <div
			    	className="slide-component-container"
			   		key={this.state.stage}>
			   		<div className="image-wrapper"><img alt="bg" src={require("./res/background.jpg")} /></div>
			   		{this.getComponent()}
		   		</div>
			</ReactCSSTransitionGroup>
		);
	}
}

const App = () => (
  <MuiThemeProvider>
    <Game />
  </MuiThemeProvider>
);


ReactDOM.render(
	<App />,
	document.getElementById('root')
);

registerServiceWorker();
