import React, { Component } from 'react';

class Lobby extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inputRoomId: '4930',
            invalidRoomId: false,
        }

        this.handleInputRoomId = this.handleInputRoomId.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateUI = this.updateUI.bind(this);
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

        if (inputRoomId === '') {
            this.updateUI(1);
            return;
        }

        this.props.onComplete();
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
        }
    }

    render() {
        return (
            <div id="lobby" className="container">
                <div className="wrapper center">
                    <form noValidate>
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
                    <div className="divider">OR</div> 
                    <div className="create-new-room">CREATE NEW ROOM</div>
                    <div className="message">You'll be given a room ID that another player can use to join you.</div>
                </div>
            </div>
        );
    }
}

export default Lobby;
