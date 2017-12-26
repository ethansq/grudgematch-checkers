import React, { Component } from 'react';

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
