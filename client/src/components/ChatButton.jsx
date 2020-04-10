import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { validateInput } from '../store/actions'


let ChatButton = ({ validateInput, submitDisabled, chatInput }) => (
  <button
    id="chat-submit"
    className="col-3"
    onClick={()=>validateInput(new Date().toDateString())}
    disabled={
      submitDisabled || !chatInput
    }>Send</button>
)

ChatButton.propTypes = {
  chatInput: PropTypes.string,
  validateInput: PropTypes.func,
  submitDisabled: PropTypes.bool
}

const mapChatButtonState = state => {
  return {
    submitDisabled: state.submitDisabled,
    chatInput: state.chatInput
  }
}
const mapChatButtonDispatch = dispatch => {
  return {
    validateInput: (obscureText) => {
      dispatch(validateInput(obscureText))
    }
  }
}

export default ChatButton = 
  connect(mapChatButtonState, mapChatButtonDispatch)(ChatButton)
