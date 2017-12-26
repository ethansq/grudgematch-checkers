import React from 'react';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import Login from './login';
import ChooseName from './choose-name';
import registerServiceWorker from './registerServiceWorker';

require('./scss/base.scss');

class Splash extends Component {
	constructor(props) {
		super(props);

		this.state = {
		}
	}

	render() {
		return (
			<div></div>
		);
	}
}

ReactDOM.render(
	// <Splash />,
	<Login />,
	document.getElementById('root')
);

registerServiceWorker();
