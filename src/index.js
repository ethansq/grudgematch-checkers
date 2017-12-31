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

var FontAwesome = require('react-fontawesome');
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
			stage: 'login',
			showProgress: false,
			role: null,
			roomId: null,
			slideDirection: 'slide',
			toolbarTitle: ''
		}

        this.handleLoginComplete = this.handleLoginComplete.bind(this);
        this.handleLobbyComplete = this.handleLobbyComplete.bind(this);
        this.handleChooseNameComplete = this.handleChooseNameComplete.bind(this);
        this.toggleIndeterminateProgressBar = this.toggleIndeterminateProgressBar.bind(this);
        this.handleBackPressed = this.handleBackPressed.bind(this);
        this.setToolbarTitle = this.setToolbarTitle.bind(this);
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
					handleBackPressed={this.handleBackPressed}
					setToolbarTitle={this.setToolbarTitle}
					roomId={this.state.roomId}
					role={this.state.role}
					toggleProgressBar={this.toggleIndeterminateProgressBar} />
			);
		}
	}

	handleChooseNameComplete() {
		this.setState({
			slideDirection: 'slide', // forwards
			stage: 'lobby'
		});
	}

	handleLoginComplete(createdNewUser) {
		this.setState({
			slideDirection: 'slide', // forwards
			stage: createdNewUser ? 'choose-name' : 'lobby'
		});
	}

	handleLobbyComplete(roomId, role) {
		this.setState({
			slideDirection: 'slide', // forwards
			roomId: roomId,
			role: role,
			stage: 'checkers'
		});
	}

	handleBackPressed() {
		switch (this.state.stage) {
			case 'checkers':
				this.setState({
					toolbarTitle: '',
					slideDirection: "slide-back", // slide backwards
					stage: 'lobby'
				});
				break;
			case 'lobby':
				this.setState({
					toolbarTitle: '',
					slideDirection: "slide-back", // slide backwards
					stage: 'choose-name'
				});
				break;
			case 'choose-name':
				// sign out first
				this.toggleIndeterminateProgressBar();

				firebase.auth().signOut()
				.then(() => {
					this.setState({
						toolbarTitle: '',
						slideDirection: "slide-back", // slide backwards
						stage: 'login'
					});
					this.toggleIndeterminateProgressBar();
				});
				break;
		}
	}

	setToolbarTitle(title) {
		this.setState({
			toolbarTitle: title
		});
	}

    toggleIndeterminateProgressBar(forceHide) {
        this.setState({
            showProgress: forceHide ? false : !this.state.showProgress
        })
    }

	render() {
        var showProgress = this.state.showProgress ? "" : "hidden";
        var showToolbar = this.state.stage === 'choose-name' || this.state.stage === 'lobby'
        	|| this.state.stage === 'checkers'
        	? "show" : "hidden";

		return (
			<ReactCSSTransitionGroup
			    transitionName={this.state.slideDirection}
			    transitionEnterTimeout={400}
			    transitionLeaveTimeout={400}
			    component='div'>

			    <div className="slide-component-container" key={this.state.stage}>
	                <div className={showToolbar+" toolbar"}>
                        <div>
	                        <FontAwesome
	                        	onClick={this.handleBackPressed}
	                            name='long-arrow-left'
	                            size='2x'
	                            inverse />
	                        <div className="title">{this.state.toolbarTitle}</div>
                        </div>
	                </div>

	                <div className={showProgress+" linear-progress"}>
	                    <LinearProgress mode="indeterminate" />
	                </div>

			   		<div className="bg image-wrapper">
			   			<img alt="bg" src={require("./res/background.jpg")} />
		   			</div>

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
