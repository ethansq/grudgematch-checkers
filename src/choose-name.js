import React, { Component } from 'react';
import * as firebase from 'firebase';

class ChooseName extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inputName: 'Turtleneck', // @TEST
            invalidName: false,
        }

        this.handleInputName = this.handleInputName.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateUI = this.updateUI.bind(this);
    }

    handleInputName(event) {
        this.setState({
            inputName: event.target.value
        });
    }

    handleSubmit(event) {
        this.updateUI(0); // reset UI
        event.preventDefault(); // don't refresh, etc

        var inputName = this.state.inputName;
        var invalid = false;

        if (inputName === '') {
            this.updateUI(1);
            return;
        }

        this.props.toggleProgressBar(); // show progress bar

        // Update Firebase with the input name
        var db = firebase.database().ref();
        db.child(firebase.auth().currentUser.uid).child("name").set(inputName)
        .then(() => {
            this.props.toggleProgressBar(); // hide progress bar
            this.props.onComplete(); // complete this screen
        });
    }

    updateUI(status) {
        switch(status) {
            case 0: // reset
                this.setState({
                    invalidName: false,
                });
                break;
            case 1: // invalid name
                this.setState({
                    invalidRoomId: true
                });
                break;
        }
    }

    render() {
        return (
            <div id="chooseName" className="container">
                <form noValidate className="center">
                    <input
                        className={this.state.invalidName ? "invalid" : ""}
                        placeholder="Choose a name"
                        id="inputName"
                        type="text"
                        value={this.state.inputName}
                        onChange={this.handleInputName} />
                    <div onClick={this.handleSubmit} className="done-button">
                        <div className="arrow"></div>
                    </div>
                </form>
            </div>
        );
    }
}

export default ChooseName;
