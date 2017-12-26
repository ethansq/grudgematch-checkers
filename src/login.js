import React, { Component } from 'react';

/**
 * On the Login screen, the user can either select to create a new room
 * or join an existing room by providing and ID#.
 * 
 * The ID# refers to a numerical number associated with each room.
 */
class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputRoomId: '',
      deadPool: false,
      turnTimer: false,
      involvedOnly: false
    }

    this.handleInputRoomId = this.handleInputRoomId.bind(this);
    this.toggleDeadPool = this.toggleDeadPool.bind(this);
    this.toggleTurnTimer = this.toggleTurnTimer.bind(this);
    this.toggleInvolvedOnly = this.toggleInvolvedOnly.bind(this);
  }

  toggleDeadPool(event) {
    this.setState({
      deadPool: !this.state.deadPool
    });
  }

  toggleTurnTimer(event) {
    this.setState({
      turnTimer: !this.state.turnTimer
    });
  }

  toggleInvolvedOnly(event) {
    this.setState({
      involvedOnly: !this.state.involvedOnly
    });
  }

  handleInputRoomId(event) {
    this.setState({
      inputRoomId: event.target.value
    });
  }

  render() {
    return (
      <div className="container">
        <div className="side-bar">
        </div>
        <div className="content">
          <div className="left">
            <div className="create">
              <h4 className="header">Create New Room</h4>
              <ul>
                <li>
                  <input
                    onChange={this.toggleDeadPool}
                    value={this.state.deadPool}
                    id="1"
                    type="checkbox"/>
                  <label htmlFor="1">Dead Pool</label></li>
                <li>
                  <input
                    onChange={this.toggleTurnTimer}
                    value={this.state.turnTimer}
                    id="2"
                    type="checkbox"/>
                  <label htmlFor="2">Turn Timer</label></li>
                <li>
                  <input
                    onChange={this.toggleInvolvedOnly}
                    value={this.state.involvedOnly}
                    id="3"
                    type="checkbox"/>
                  <label htmlFor="3">Involved Only</label></li>
              </ul>
              <div className="new-room">START</div>
            </div>
          </div>
          <div className="divider">
            <div className="divider-line"></div>
            <div className="or-text">OR</div>
          </div>
          <div className="right">
            <div className="join">
            <h4 className="header">Join A Room</h4>
              <input
                value={this.state.inputRoomId}
                onChange={this.handleInputRoomId}
                className="input-room-id"
                placeholder="ID#"
                type="text"
                pattern="[0-9]*" />
              <div className="join-room">JOIN</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
