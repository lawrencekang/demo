/* eslint-disable no-alert */
import axios from 'axios';
import * as actionTypes from './actionTypes';

const WPM = 60; // used to set delay on doctor 'typing'

// Simple action creator
function setActiveQuestionIndex(activeQuestionIndex) {
  return {
    type: actionTypes.SET_ACTIVE_QUESTION_INDEX,
    activeQuestionIndex,
  };
}

function setAnswerOnQuestion() {
  return {
    type: actionTypes.SET_ANSWER_ON_QUESTION,
  };
}

function receiveQuestions(questions) {
  return {
    type: actionTypes.RECEIVE_QUESTIONS,
    questions,
  };
}

function updateInput(inputValue) {
  return {
    type: actionTypes.SET_CHAT_INPUT,
    chatInput: inputValue,
  };
}

function setAgentTyping(value) {
  return {
    type: actionTypes.SET_AGENT_TYPING,
    value,
  };
}

function disableSubmit() {
  return {
    type: actionTypes.DISABLE_SUBMIT,
  };
}

function enableSubmit() {
  return {
    type: actionTypes.ENABLE_SUBMIT,
  };
}

function enableShowResponses() {
  return {
    type: actionTypes.ENABLE_SHOW_RESPONSES,
  };
}

function setError(error) {
  return {
    type: actionTypes.SET_ERROR,
    error,
  };
}

// Thunks

/*
  appendToConversation controls all of the text that gets displayed in
  the ChatWindow.
*/
function appendToConversation(speaker, text) {
  let answers = false;
  if (Array.isArray(text)) {
    answers = true;
  }
  const date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let z = 'am';
  if (hours > 12) {
    hours -= 12;
    z = 'pm';
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  return {
    type: actionTypes.APPEND_TO_CONVERSATION,
    speaker: speaker.name,
    speakerType: speaker.type,
    text,
    timestamp: `${hours}:${minutes} ${z}`,
    answers,
  };
}

/*
  delayedAppend is not required for functionality, but simulates a delay before
  displaying text in the ChatWindow, based on the time required for a user to
  type.
*/
function delayedAppend(speaker, text, terminal) {
  let delay = 1000;
  if (!Array.isArray(text)) {
    const words = text.split(' ').length;
    delay = words / WPM * 250 * 60;
  }
  return (dispatch) => {
    setTimeout(() => {
      dispatch(setAgentTyping(false));
      dispatch(appendToConversation(speaker, text));
      if (!terminal) {
        dispatch(enableSubmit());
      }
    }, delay);
  };
}

function nextQuestion(activeQuestionIndex) {
  return (dispatch, getState) => {
    dispatch(setAgentTyping(true));
    const state = getState();
    let terminal = false;
    const activeQuestion = state.questions[activeQuestionIndex];
    if (activeQuestion.paths === undefined) {
      terminal = true;
    }
    dispatch(delayedAppend(state.agent, activeQuestion.question, terminal));
  };
}

function getPath(state, chatInput) {
  const { paths } = state.questions[state.activeQuestionIndex];
  const pathType = Array.isArray(paths) ? 'array' : typeof paths;
  switch (pathType) {
    case 'undefined':
      return undefined;
    case 'number':
      return paths > 0 ? paths : 0;
    case 'object': {
      const formattedInput = chatInput.toLowerCase();
      return paths[formattedInput] > 0 ? paths[formattedInput] : 0;
    }
    default:
      return undefined;
  }
}

/*
  validAnswer() returns a boolean based on whether the current chatInput
  passes the validation required in the current activeQuestion
  TODO: replace special characters (e.g. punctuation) when validating against
  string values.
*/
function validAnswer(state) {
  //  handle the case where were using the "-1" question index
  const activeQuestion = state.questions[state.activeQuestionIndex];
  const currentInput = state.chatInput;
  const { validation } = activeQuestion;
  const validationType = Array.isArray(validation) ? 'array' : typeof validation;

  switch (validationType) {
    case 'array':
      if (validation.indexOf(currentInput.toLowerCase()) > -1) {
        return true;
      }
      return false;
    case 'string': {
      const regexTest = RegExp(validation);
      if (regexTest.test(currentInput)) {
        return true;
      }
      return false;
    }
    case 'boolean':
      return validation || undefined; // using undefined for terminal validation
    default:
      return undefined;
  }
}

/*
  getHelperPrompt is a helper method to make suggestions to the user when an
  incorrect input is received.
*/
function getHelperPrompt(state) {
  const activeQuestion = state.questions[state.activeQuestionIndex];
  const { validation } = activeQuestion;
  const validationType = Array.isArray(validation) ? 'array' : typeof validation;
  const randomInvalidPromptIndex = Math.floor(
    Math.random() * Math.floor(state.invalidAnswerPrompts.length),
  );
  const randomPrompt = state.invalidAnswerPrompts[randomInvalidPromptIndex];
  switch (validationType) {
    case 'array':
      return `${randomPrompt}  Please answer "${validation.join('," or "')}."`;
    case 'string':
      if (activeQuestion.question.indexOf('email') > -1) {
        return 'I was looking for an email address, can you check the format and try again?';
      }
      if (activeQuestion.question.indexOf('born') > -1) {
        return `${randomPrompt}  Format your answer as MM/DD/YYYY.`;
      }
      if (activeQuestion.question.indexOf('password') > -1) {
        return 'Your password should be at least six characters in length.';
      }
      return '';
    default:
      return '';
  }
}

function sendAnswer(chatInput) {
  return (dispatch, getState) => {
    const state = getState();
    axios.put(`https://jsonplaceholder.typicode.com/posts/${state.activeQuestionIndex}`, {
      answer: chatInput,
    })
      .then((response) => {
        if (response.status === 200) {
          const path = getPath(state, chatInput);
          if (path !== undefined) {
            dispatch(setActiveQuestionIndex(path));
            dispatch(nextQuestion(path));
          }
        }
      })
      .catch((error) => {
        // TODO: decide how to handle the error here, with either a silent fail or a user alert.
        dispatch(setError(error));
      });
  };
}


/*
  agentResponse controls the flow of the conversation, moving on to the next
  question if a valid answer is received, and promting the user if not.
*/
function agentResponse(answerIsValid, chatInput) {
  return (dispatch, getState) => {
    dispatch(setAgentTyping(true));
    const state = getState();
    if (answerIsValid === true) {
      dispatch(sendAnswer(chatInput));
    } else if (answerIsValid === false) {
      // Invalid answer, prompt user with hints
      const helperPrompt = getHelperPrompt(state);
      dispatch(appendToConversation(state.agent, helperPrompt));
      dispatch(enableSubmit());
      dispatch(setAgentTyping(false));
    }
  };
}


function validateInput(obscureText) {
  return (dispatch, getState) => {
    const state = getState();
    let { chatInput } = state;
    if (obscureText) {
      chatInput = '(Hidden for your security).';
    }
    dispatch(disableSubmit());
    dispatch(appendToConversation(state.user, chatInput));
    const answerIsValid = validAnswer(state);
    if (answerIsValid) {
      dispatch(setAnswerOnQuestion());
      dispatch(updateInput(''));
      if (state.showResponsesDisabled) {
        dispatch(enableShowResponses());
      }
    } else {
      dispatch(updateInput(''));
    }
    setTimeout(() => {
      dispatch(agentResponse(answerIsValid, chatInput));
    }, Math.floor(Math.random() * Math.floor(1.5, 4) * 1000));
  };
}

function getQuestions() {
  return (dispatch) => {
    const questionsUrl = 'https://gist.githubusercontent.com/pcperini/'
    + '97fe41fc42ac1c610548cbfebb0a4b88/raw/'
    + 'cc07f09753ad8fefb308f5adae15bf82c7fffb72/cerebral_challenge.json';
    return axios.get(questionsUrl)
      .then((response) => {
        dispatch(receiveQuestions(response.data));
        dispatch(setActiveQuestionIndex(1));
        dispatch(nextQuestion(1));
      })
      .catch((error) => {
        alert.error(`Something went wrong: ${error}`);
      });
  };
}

function formatResponses(answeredQuestions) {
  const answers = [];
  for (let i = 0; i < answeredQuestions.length; i += 1) {
    const item = answeredQuestions[i];
    answers.push({
      question: item.question,
      answer: item.answer,
    });
  }
  return answers;
}

function showResponses() {
  return (dispatch, getState) => {
    const state = getState();
    const answeredQuestions = state.questions.filter(item => !!item.answer);
    if (answeredQuestions.length) {
      dispatch(appendToConversation(state.agent,
        "Here's how you've answered the questions so far."));
      dispatch(delayedAppend(state.agent, formatResponses(answeredQuestions)));
    }
  };
}

function connectToWebsocket() {
  return () => {
    const socket = new WebSocket('wss://echo.websocket.org');
    socket.addEventListener('open', () => {
      alert('Socket opened!');
    });
  };
}

export {
  disableSubmit,
  enableSubmit,
  getQuestions,
  showResponses,
  updateInput,
  validateInput,
  appendToConversation,
  connectToWebsocket,
};
