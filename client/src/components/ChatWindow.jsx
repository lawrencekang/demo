import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

const mapStateToProps = state => {
  return {
    conversation: state.conversation,
    agentTyping: state.agentTyping
  }
}

/* 
  ChatWindow uses a class component because of the need to hook into the 
  componentDidUpdate lifecycle method.
  
  This component uses a ref to control an animation, which is an acceptable
  use case per the React docs.

  Rendering of normal chat statements vs. showing all previously answered
  questions is handled together in this component, but could be broken out
  into sub-components.
*/
class ChatWindow extends React.Component {

  constructor(props) {
    super(props)
    this.conversationAnchorRef = React.createRef();
  }

  componentDidUpdate(){
    this.conversationAnchorRef.current.scrollIntoView({ behavior: "smooth" });
  }

  render () {
    return (  
      <React.Fragment>
        <div id="conversation" className="row">
          <div className="col-12">
            {this.props.conversation.map((statement, index) => {
              if (statement.answers === false) {
                return (
                  <div 
                    className={
                      "chat-statement row" + 
                      (statement.speakerType == 'user' ? ' user-statement' : '')
                    } 
                    key={index}>
                    <div className="col-12">
                      <div className="identifier">
                          <span className="agent-name">
                            { statement.speaker }
                          </span>
                          <span className="timestamp">
                            at { statement.timestamp }:
                          </span>
                      </div>
                      <p>{ statement.text }</p>
                      
                    </div>
                  </div>
                  )
              } else {
                return statement.text.map((answeredQuestion, index) => {        
                  return (
                    <div className={"chat-statement row"} key={index}>
                      <div className="col-12">
                        <p>Question: {answeredQuestion.question}</p>
                        <p className="user-statement">
                          Answer: {answeredQuestion.answer}
                        </p>                    
                      </div>
                    </div>
                  )
                }    
              )}
            })}
            <div id="conversation-anchor"
              ref={this.conversationAnchorRef}></div>
          </div>
        </div>
      
        <div id="agent-indicator" className="row">
          <div className="col-12">
            { this.props.agentTyping &&
                <p>The onboarding agent is typing</p>
            }
          </div>
        </div>
      </React.Fragment>
    )
  }
}


ChatWindow.propTypes = {
  conversation: PropTypes.arrayOf(
    PropTypes.shape({
      speaker: PropTypes.string,
      speakerType: PropTypes.string,
      text: PropTypes.oneOfType([PropTypes.string.isRequired,PropTypes.array]),
      timestamp: PropTypes.string,
      answers: PropTypes.boolean
    })
  )
}

ChatWindow = connect(mapStateToProps, null)(ChatWindow)

export default ChatWindow
