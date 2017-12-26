import React, { Component } from 'react';
import * as firebase from 'firebase';
import LinearProgress from 'material-ui/LinearProgress';

const INVALID_EMAIL = "Please enter a valid e-mail address.";
const WRONG_PASSWORD = "Your password was incorrect.";
const INVALID_PASSWORD = "Please include a minimum of 6 characters.";

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inputEmail: 'admin@admin.com',
            inputPassword: 'password',
            invalidEmail: false,
            invalidPassword: false,
            passwordStatus: '',
            showProgress: false
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

    toggleIndeterminateProgressBar() {
        this.setState({
            showProgress: !this.state.showProgress
        })
    }

    handleLoginSubmit(event) {
        this.toggleIndeterminateProgressBar(); // show progress bar to indicate loading status
        this.updateUI(0);

        firebase.auth().signInWithEmailAndPassword(this.state.inputEmail, this.state.inputPassword)
        .then(() => {
            this.toggleIndeterminateProgressBar(); // done auth, hide progress bar
            this.props.onComplete();
        })
        .catch((error) => {
            switch (error.code) {
                case 'auth/wrong-password':
                    this.updateUI(3);
                    this.toggleIndeterminateProgressBar();
                    break;
                case 'auth/invalid-email':
                    this.updateUI(1);
                    this.toggleIndeterminateProgressBar(); // hide progress bar, bad email
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
            this.toggleIndeterminateProgressBar(); // done auth, hide progress bar
            this.props.onComplete();
        })
        .catch((error) => {
            this.toggleIndeterminateProgressBar();

            switch (error.code) {
                case 'auth/weak-password':
                this.updateUI(2);
                break;
            }
        });
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.props.onComplete();
            } else {
                console.log("Not authenticated");
            }
        });
    }

    render() {
        var showProgress = (this.state.showProgress) ? "" : "hidden";
        var invalidEmail = (this.state.invalidEmail) ? "show" : "hidden";
        var invalidPassword = (this.state.invalidPassword) ? "show" : "hidden";

        return (
            <div id="login" className="container">
                <div className={showProgress+" linear-progress"}>
                    <LinearProgress mode="indeterminate" />
                </div>

                <form noValidate className="center">
                    <input
                        className={this.state.invalidEmail ? "invalid" : ""}
                        placeholder="E-mail Address" id="inputEmail" type="email"
                        value={this.state.inputEmail} onChange={this.handleInputEmailChange} />
                    <div className={invalidEmail+" invalid-email"}>
                        Please enter a valid e-mail address.
                    </div>
                    
                    <input
                        className={this.state.invalidPassword ? "invalid" : ""}
                        placeholder="Password" id="inputPassword" type="password"
                        value={this.state.inputPassword} onChange={this.handleInputPasswordChange} />
                    <div className={invalidPassword+" invalid-password"}>
                        {
                            this.state.passwordStatus === 'WRONG'
                                ? WRONG_PASSWORD
                                : INVALID_PASSWORD
                        }
                    </div>

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