import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { disableSubmit, updateInput, validateInput } from '../store/actions'

let ChatInput = ({ chatInput, handleInput, handleKeyPress,
    question, submitDisabled }) => (
  <input
    placeholder="Type here..."
    className="col-9"
    type={ question.indexOf("password") > -1 ? 'password' : 'text'}
    value={chatInput}
    onChange={(event)=>handleInput(event)}
    onKeyPress={(event)=>handleKeyPress(event, submitDisabled)}></input>
)

ChatInput.propTypes = {
  question: PropTypes.string,
  chatInput: PropTypes.string,
  handleInput: PropTypes.func,
  handleKeyPress: PropTypes.func,
  submitDisabled: PropTypes.bool
}

const mapChatInputState = state => {
  let question = ''
  if (state.questions.length && state.activeQuestionIndex) {
    question = state.questions[state.activeQuestionIndex].question
  }
  return {
    chatInput: state.chatInput,
    question,
    submitDisabled: state.submitDisabled
  }
}

const mapChatInputDispatch = dispatch => {
  return {
    handleInput: event => {
      // Passwords shouldn't be asked for in a chat app and put into a store
      // without some sort of hashing; for demo purposes, the password is not
      // hashed but is obscured.
      let inputValue = event.target.value
      if (event.target.getAttribute('type') === 'password') {
        inputValue = inputValue.replace(/./g, '*')
      }
      dispatch(updateInput(inputValue))},
    handleKeyPress: (event, submitDisabled) => {
      if (submitDisabled) {
        return
      }
      if (event.key=='Enter') {
        let obscureText = false;
        if (event.target.getAttribute('type') === 'password'){
          obscureText = true;  
        }
        dispatch(disableSubmit())
        dispatch(validateInput(obscureText))
      }
    }
  }
}

export default ChatInput =
  connect(mapChatInputState, mapChatInputDispatch)(ChatInput)
