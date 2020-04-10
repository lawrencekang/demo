import React from 'react'
import ChatButton from './ChatButton.jsx'
import ChatInput from './ChatInput.jsx'

const ChatBar = () => (
  <div id="chat-bar" className="row">
    <ChatInput/><ChatButton/>
  </div>
)

export default ChatBar
