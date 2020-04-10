import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect } from 'react-redux'
import configureStore from './store/index'
import ChatWindow from './components/ChatWindow.jsx'
import ChatBar from './components/ChatBar.jsx'
import PropTypes from 'prop-types'
import { appendToConversation, getQuestions } from './store/actions'
import './styles/cerebralStyles.scss'
import 'bootstrap/dist/css/bootstrap.min.css';
import { showResponses, connectToWebsocket } from './store/actions'

const store = configureStore();

class ChatWrapper extends React.Component {
  constructor(props){
    super(props);
  }
  componentDidMount() {
    store.dispatch(appendToConversation(this.props.agent, 'Hello!  Please give me a moment to set up.  In a moment, I\'ll be asking you a few questions to get you onboarded.', null))
    setTimeout(()=> {
      store.dispatch(getQuestions())
    }, 5000)
  }
  render() {
    return (
      <React.Fragment>
        <div id="background-top"></div>
        <div id='background-bottom'></div>
        <div className="container">
          <div id="logo" className="row">
            <div className="logo-wrapper col-lg-6 offset-lg-3 col-sm-10 offset-sm-1">
              <img src="https://static1.squarespace.com/static/5c146b54b27e39467e06d6a1/t/5cd39cd0e2c4831b196350b0/1558572162189/?format=1500w"></img>
            </div>
          </div>
          <div className="row">
            <div id="chat-wrapper" className="col-lg-6 offset-lg-3 col-sm-10 offset-sm-1">
              <ChatWindow/>
              <ChatBar/>
            </div>
          </div>
          <div className="row">
            <div className="stretch-button-wrapper col-3 offset-3">
              <button disabled={this.props.showResponsesDisabled} className="stretch-button" onClick={() => this.props.triggerShowResponses()}>Show Responses</button>
            </div>
            <div className="stretch-button-wrapper col-3">
              <button className="stretch-button" onClick={() => this.props.triggerWebsocket()}>Connect to a Doctor</button>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

ChatWrapper.propTypes = {
  triggerShowResponses: PropTypes.func,
  triggerWebsocket: PropTypes.func,
  agent: PropTypes.object,
  showResponsesDisabled: PropTypes.bool
}

const mapStateToProps = state => {
  return {
    agent: state.agent,
    showResponsesDisabled: state.showResponsesDisabled
  }
}

const mapDispatchToProps = dispatch => {
  return {
    triggerShowResponses: () => {
      dispatch(showResponses())
    },
    triggerWebsocket: () => {
      dispatch(connectToWebsocket())
    }
  }
}

ChatWrapper = connect(mapStateToProps, mapDispatchToProps)(ChatWrapper)

ReactDOM.render(
  <Provider store={store}>
    <ChatWrapper>
    </ChatWrapper>
  </Provider>,
  document.getElementById('react')
);
