import React, { Component } from 'react';

class ChooseName extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputName: '',
    }

    this.handleInputName = this.handleInputName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
}

  handleInputName(event) {
    this.setState({
      inputName: event.target.value
    });
  }

  handleSubmit(event) {

  }

  render() {
    return (
      <div className="container">
        <div className="side-bar">
        </div>
        <div id="choose-name" className="content">
            <form className="center" onSubmit={this.handleSubmit}>
                <input
                    placeholder="CHOOSE A NAME"
                    id="subscribeEmail"
                    type="text"
                    value={this.state.inputName}
                    onChange={this.handleInputName} />
                <button type="submit" className="done-button arrow" value="Submit" />
            </form>
        </div>
      </div>
    );
  }
}

export default ChooseName;
