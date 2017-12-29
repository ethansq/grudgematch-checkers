import React from 'react';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import Login from './login';
import ChooseName from './choose-name';
import Lobby from './lobby';
import Checkers from './checkers';
import registerServiceWorker from './registerServiceWorker';
import * as firebase from 'firebase';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LinearProgress from 'material-ui/LinearProgress';

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

// Firebase configurations
const firebaseConfig = require('./firebase.json');
firebase.initializeApp(firebaseConfig);

// Import our SCSS
require('./scss/base.scss');

class Game extends Component {
	constructor(props) {
		super(props);

		this.state = {
			stage: 'login', // 'lobby', 'checkers'
			showProgress: false
		}

        this.handleLoginComplete = this.handleLoginComplete.bind(this);
        this.handleLobbyComplete = this.handleLobbyComplete.bind(this);
        this.handleChooseNameComplete = this.handleChooseNameComplete.bind(this);
        this.toggleIndeterminateProgressBar = this.toggleIndeterminateProgressBar.bind(this);
	}

	getComponent() {
		if (this.state.stage === 'login') {
			return (
				<Login
					toggleProgressBar={this.toggleIndeterminateProgressBar}
					onComplete={this.handleLoginComplete} />
			);
		} else if (this.state.stage === 'choose-name') {
			return (
				<ChooseName
					toggleProgressBar={this.toggleIndeterminateProgressBar}
					onComplete={this.handleChooseNameComplete} />
			);
		} else if (this.state.stage === 'lobby') {
			return (
				<Lobby
					toggleProgressBar={this.toggleIndeterminateProgressBar}
					onComplete={this.handleLobbyComplete} />
			);
		} else if (this.state.stage === 'checkers') {
			return (
				<Checkers
					roomId={this.state.roomId}
					toggleProgressBar={this.toggleIndeterminateProgressBar} />
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
			// stage: createdNewUser ? 'choose-name' : 'lobby'
			stage: 'choose-name' // @TEST
		});
	}

	handleLobbyComplete(roomId) {
		this.setState({
			roomId: roomId,
			stage: 'checkers'
		});
	}

    toggleIndeterminateProgressBar() {
        this.setState({
            showProgress: !this.state.showProgress
        })
    }

	render() {
        var showProgress = (this.state.showProgress) ? "" : "hidden";

		return (
			<ReactCSSTransitionGroup
			    transitionName='slide'
			    transitionEnterTimeout={400}
			    transitionLeaveTimeout={400}
			    component='div'>

			    <div
			    	className="slide-component-container"
			   		key={this.state.stage}>
            
	                <div className={showProgress+" linear-progress"}>
	                    <LinearProgress mode="indeterminate" />
	                </div>

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
