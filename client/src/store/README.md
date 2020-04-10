## Actions and control flow
In general the control flow works by:

- The agent chatting the user a question.
- The user responding to the question.
- Validation occurs based on the question's validation rules:
  - if the response is invalid, the agent will respond with a helper prompt.
  - if the response is valid, the agent will respond with the next question.
- At any time after the user has validly answered at least one question, the user can see all of their previous responses by clicking a button.
- At any time, the user can click on a button to create a connection to a doctor.

This is accomplished using `thunks`, which allows for actions to be functions rather than  objects. Using thunks moves the control flow for the chat app into the actions logic.

## State
activeQuestionIndex: `int` to keep track of where we are in the sequence of Questions

agent: `object` representing the agent's data.

agentTyping: `bool` True when the agent is typing, used for UI indicator.

chatInput: `str` content of the chat input field.

conversation: `array` containing the entire chat history, in the format:
```json
{
  "speaker": "string - name of speaker",
  "speakerType": "string - user or agent",
  "text": "string - what the person said",
  "timestamp": "string - when the person spoke",
  "answers": "string - the user's recorded, valid response"
}
```

invalidAnswerPrompts: `array` containing conversational options when notifying the user of an invalid response.

submitDisabled: `bool` toggles the chat button's disabled status.

showResponseDisabled: `bool` toggles the "Show Responses" button's disabled status. 

questions: `array` of question objects loaded from remote endpoint.

user: `object` representing the user's data.
