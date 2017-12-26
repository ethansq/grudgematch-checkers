import React, { Component } from 'react';

/*
*/
class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inputEmail: '',
            inputPassword: ''
        }

        this.handleInputEmailChange = this.handleInputEmailChange.bind(this);
        this.handleInputPasswordChange = this.handleInputPasswordChange.bind(this);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    }

    handleInputEmailChange(event) {
        this.setState({
            inputEmail: event.target.value
        });
    }

    handleInputPasswordChange(event) {
        this.setState({
            inputPassword: event.target.value
        });
    }

    handleLoginSubmit(event) {
        console.log("handleLoginSubmit");
    }

    render() {
        return (
            <div id="login" className="content">
                <form noValidate className="center">
                    <input placeholder="E-mail Address" id="inputEmail" type="email"
                        value={this.state.inputEmail} onChange={this.handleInputEmailChange} />
                    <input placeholder="Password" id="inputPassword" type="password"
                        value={this.state.inputPassword} onChange={this.handleInputPasswordChange} />
                    <div onClick={this.handleLoginSubmit} className="login-button">SIGN IN</div>
                    <div className="message">
                        Don't worry, we only use your e-mail for identification purposes.
                    </div>
                </form>
            </div>
        );
    }
}

export default Login;