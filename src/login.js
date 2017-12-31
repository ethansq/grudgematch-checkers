import React, { Component } from 'react';
import * as firebase from 'firebase';

const INVALID_EMAIL = "Please enter a valid e-mail address.";
const WRONG_PASSWORD = "Your password was incorrect.";
const INVALID_PASSWORD = "Please include a minimum of 6 characters.";

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inputEmail: 'admin@admin.com', // @TEST
            inputPassword: 'password', // @TEST
            invalidEmail: false,
            invalidPassword: false,
            passwordStatus: '',
        }

        this.handleInputEmailChange = this.handleInputEmailChange.bind(this);
        this.handleInputPasswordChange = this.handleInputPasswordChange.bind(this);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
        this.updateUI = this.updateUI.bind(this);
        this.createNewUserAndAuthenticate = this.createNewUserAndAuthenticate.bind(this);
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

    updateUI(status) {
        switch(status) {
            case 0: // reset
                this.setState({
                    invalidEmail: false,
                    invalidPassword: false,
                    passwordStatus: ''
                });
                break;
            case 1: // invalid email
                this.setState({
                    invalidEmail: true
                });
                break;
            case 2: // weak password, need 6 chars
                this.setState({
                    invalidPassword: true
                });
                break;
            case 3: // wrong password
                this.setState({
                    invalidPassword: true,
                    passwordStatus: 'WRONG'
                });
                break;
        }
    }

    handleLoginSubmit(event) {
        this.props.toggleProgressBar(); // show progress bar to indicate loading status
        this.updateUI(0);

        firebase.auth().signInWithEmailAndPassword(this.state.inputEmail, this.state.inputPassword)
        .then(() => {
            this.props.toggleProgressBar(); // done auth, hide progress bar
            this.props.onComplete(false);
        })
        .catch((error) => {
            switch (error.code) {
                case 'auth/wrong-password':
                    this.updateUI(3);
                    this.props.toggleProgressBar();
                    break;
                case 'auth/invalid-email':
                    this.updateUI(1);
                    this.props.toggleProgressBar(); // hide progress bar, bad email
                    break;
                case 'auth/user-not-found':
                    this.createNewUserAndAuthenticate(this.state.inputEmail, this.state.inputPassword);
                    break;
            }
        });
    }

    createNewUserAndAuthenticate(email, password) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
            // Once account is created, log in
            firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                this.props.toggleProgressBar(); // done auth, hide progress bar
                this.props.onComplete(true);
            });
        })
        .catch((error) => {
            this.props.toggleProgressBar();

            switch (error.code) {
                case 'auth/weak-password':
                this.updateUI(2);
                break;
            }
        });
    }

    componentDidMount() {
        var unsub = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log("Authentication persisted");
                this.props.onComplete(false);
            } else {
                console.log("Not authenticated");
            }
            unsub();
        });
    }

    render() {
        var invalidEmail = (this.state.invalidEmail) ? "show" : "hidden";
        var invalidPassword = (this.state.invalidPassword) ? "show" : "hidden";

        return (
            <div id="login" className="container">
                <form noValidate className="center">
                    <input
                        className={this.state.invalidEmail ? "invalid" : ""}
                        placeholder="E-mail Address" id="inputEmail" type="email"
                        value={this.state.inputEmail}
                        onChange={this.handleInputEmailChange} />
                    <div className={invalidEmail+" invalid-email"}>
                        Please enter a valid e-mail address.
                    </div>
                    
                    <input
                        className={this.state.invalidPassword ? "invalid" : ""}
                        placeholder="Password" id="inputPassword" type="password"
                        value={this.state.inputPassword}
                        onChange={this.handleInputPasswordChange} />
                    <div className={invalidPassword+" invalid-password"}>
                        {
                            this.state.passwordStatus === 'WRONG'
                                ? WRONG_PASSWORD
                                : INVALID_PASSWORD
                        }
                    </div>

                    <div onClick={this.handleLoginSubmit} className="login-button">
                        <div>SIGN IN</div>
                    </div>
                    
                    <div className="message">
                        You can use any e-mail, as long as you remember the password for it. We won't ever send you anything.
                    </div>
                </form>
            </div>
        );
    }
}

export default Login;