import React, { Component } from 'react';

class Lobby extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inputRoomId: '',
            inputName: '',
            invalidRoomId: false,
            invalidName: false
        }

        this.handleInputName = this.handleInputName.bind(this);
        this.handleInputRoomId = this.handleInputRoomId.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateUI = this.updateUI.bind(this);
    }

    handleInputName(event) {
        this.setState({
            inputName: event.target.value
        });
    }

    handleInputRoomId(event) {
        this.setState({
            inputRoomId: event.target.value
        });
    }

    handleSubmit(event) {
        this.updateUI(0); // reset UI
        event.preventDefault(); // don't reload, etc

        var inputName = this.state.inputName;
        var inputRoomId = this.state.inputRoomId;
        var invalid = false;

        if (inputName === '') {
            this.updateUI(1);
            invalid = true;
        }

        if (inputRoomId === '') {
            this.updateUI(2);
            invalid = true;
        }

        if (!invalid) {
            this.props.onComplete();
        }
    }

    updateUI(status) {
        switch(status) {
            case 0: // reset
                this.setState({
                    invalidRoomId: false,
                    invalidName: false,
                });
                break;
            case 1: // invalid room id
                this.setState({
                    invalidName: true
                });
                break;
            case 2: // invalid name
                this.setState({
                    invalidRoomId: true
                });
                break;
        }
    }

    render() {
        return (
            <div id="lobby" className="container">
                <form noValidate className="center">
                    <input
                        className={this.state.invalidName ? "invalid" : ""}
                        placeholder="CHOOSE A NAME"
                        id="inputName"
                        type="text"
                        value={this.state.inputName}
                        onChange={this.handleInputName} />
                    <input
                        className={this.state.invalidRoomId ? "invalid" : ""}
                        value={this.state.inputRoomId}
                        onChange={this.handleInputRoomId}
                        id="inputRoomId"
                        placeholder="ID #"
                        type="text"
                        pattern="[0-9]*" />
                    <div onClick={this.handleSubmit} className="done-button">
                        <div className="arrow"></div>
                    </div>
                </form>
            </div>
        );
    }
}

export default Lobby;
