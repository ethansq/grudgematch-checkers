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
			showProgress: false,
			role: null,
			roomId: null,
			showStatusMessage: false,
			statusMessage: ''
		}

        this.handleLoginComplete = this.handleLoginComplete.bind(this);
        this.handleLobbyComplete = this.handleLobbyComplete.bind(this);
        this.handleChooseNameComplete = this.handleChooseNameComplete.bind(this);
        this.toggleIndeterminateProgressBar = this.toggleIndeterminateProgressBar.bind(this);
        this.toggleStatusMessage = this.toggleStatusMessage.bind(this);
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
					toggleStatusMessage={this.toggleStatusMessage}
					roomId={this.state.roomId}
					role={this.state.role}
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

	handleLobbyComplete(roomId, role) {
		console.log("role="+role);
		this.setState({
			roomId: roomId,
			role: role,
			stage: 'checkers'
		});
	}

    toggleIndeterminateProgressBar(forceHide) {
        this.setState({
            showProgress: forceHide ? false : !this.state.showProgress
        })
    }

    toggleStatusMessage(message, show, type) {
    	if (show) {
    		this.setState({
    			statusMessage: message,
    			showStatusMessage: true,
    			statusType: type
    		});
    	} else {
    		this.setState({showStatusMessage: false});
    	}
    }

	render() {
        var showProgress = this.state.showProgress ? "" : "hidden";

		var showStatusMessage = this.state.showStatusMessage ? "" : "hidden";
        var statusClasses = ["status", showStatusMessage, this.state.statusType];
		
		return (
			<ReactCSSTransitionGroup
			    transitionName='slide'
			    transitionEnterTimeout={400}
			    transitionLeaveTimeout={400}
			    component='div'>

			    <div className="slide-component-container" key={this.state.stage}>
	                <div className={showProgress+" linear-progress"}>
	                    <LinearProgress mode="indeterminate" />
	                </div>

			   		<div className="bg image-wrapper">
			   			<img alt="bg" src={require("./res/background.jpg")} />
		   			</div>
			   		
			   		{this.getComponent()}

			   		<div className={statusClasses.join(' ')}>
			   			<div className="shimmer">
			   				{this.state.statusMessage}
			   			</div>
				    </div>
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
