import React, { Component } from 'react';
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

/*
*/
class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    render() {
        return (
        	<div onClick={this.props.onComplete}>
    			I'M THE LOGIN COMPNENT
			</div>
        );
    }
}

export default Login;
