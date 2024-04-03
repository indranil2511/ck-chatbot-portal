import React, { useState, useEffect, useRef } from 'react';
import './App.css'
import Lottie from 'react-lottie';
import animationData from './animation.json';
import LoadingComponent from './component/LoadingComponent';
const App = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [answer, setAnswer] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputHeight, setInputHeight] = useState('auto');
  const [showQuestion, setShowQuestion] = useState(true)
  const ref = useRef(null);
  useEffect(() => {
    if(messages.length>1){
      setShowQuestion(false)
    }
    if (answer!=='' || isOpen) {
      ref.current?.scrollIntoView({
        behavior: "instant",
      });
    }
  }, [isOpen,answer,messages]);
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Display a welcome message when the chat window is first opened
      const welcomeMessage = {
        id: 'welcome-message',
        text:`Hi! I'm Zoe, your AI Assistant for queries regarding CloudKaptan and its services. 
        You can begin by asking questions such as:`,
        sender: 'assistant',
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);
  useEffect(() => {
    if (answer !== '') {
      const assistantMessage = messages[messages.length - 1];
      assistantMessage.text = answer;
    }
  }, [answer]);
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setInputHeight(e.target.scrollHeight);
  };
  const toggleChat = () => {
    setIsOpen(true);
  };
  const closeChat = () => {
    setIsOpen(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      handleMessageSubmit(e);
    }
  };
  const handleButtonClick = (question) => {
    if (question.trim() === '') return;
    setDisabled(true);
    const userMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text: question,
      sender: 'user',
    };
    setMessages(prevMessages => [...prevMessages, userMessage]); // Add user message separately
    // Call the function to handle the message submission
    const assistantMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text: <LoadingComponent/>,
      sender: 'assistant',
    };
    setAnswer('');
    setMessages(prevMessages => [...prevMessages, assistantMessage]);

    callPythonFunction(question).then((response) => {
      setDisabled(false);
    });
  };

  async function callPythonFunction(value) {
    const response = await fetch('https://ck-chatbot-23cd1f171035.herokuapp.com/api/callToSearch/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: value })
    })
    if (!response.ok || !response.body) {
      console.log(response.statusText);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const loopRunner = true;
    while (loopRunner) {
      // Here we start reading the stream, until its done.
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      const decodedChunk = decoder.decode(value, { stream: true });
      setAnswer(answer => answer + decodedChunk); // update state with new chunk
    }
  }

  const handleMessageSubmit = async (e) => {
    setInputHeight('56px');
    setDisabled(true);
    e.preventDefault();
    handleButtonClick(inputText);
    setInputText('')
  };
return (
  <div className={{"paddingTop":"1.25rem"}}>
    <div className={`window-container ${isOpen ? 'hidden' : ''}`}>
      <div className="toggle-container">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="tick">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        May I Help You?
      </div>
      <div className="toggle-header">
        <svg
          fill="#1b7898"
          height="3rem"
          width="3rem"
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 28.769 28.769"
          xmlSpace="preserve"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <g>
              <g id="c106_arrow">
                <path d="M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z"></path>
              </g>
              <g id="Capa_1_26_"></g>
            </g>
          </g>
        </svg>
      </div>
        <button
          onClick={toggleChat}
          title='May I Help You'
          className='toggle-button'
        >
        {/* Message Icon */}
        <Lottie options={defaultOptions} height={50} width={50} />
      </button>
    </div>
    <div
      className={` ${
        isOpen ? 'chat-window' : 'chat-window hidden'
      }`}
    >
      <div className='chat-window-container'>
        <div className='chat-window-header'>
          <h2 className='header-text'>Ask Zoe !</h2>
          <button onClick={closeChat} className='close-button'>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className='close'
            >
              <path
                fill="#ffffff"
                d="M16 22a2 2 0 0 1-1.41-.59l-10-10a2 2 0 0 1 2.82-2.82L16 17.17l8.59-8.58a2 2 0 0 1 2.82 2.82l-10 10A2 2 0 0 1 16 22Z"
                className="color000 svgShape color011012"
              ></path>
            </svg>
          </button>
        </div>
        <div className='chat-body'>
          {messages.map((message,index) => (
            <div
              key={message.id}
              className={`${
                message.sender === 'user' ? 'user-chat-container' : 'assistant-chat-container'
              }`}
            >
              <div
                style={{ whiteSpace: 'pre-line' }}
                className={`${
                  message.sender === 'user' ? 'user-chat' : 'assistant-chat'
                } chat`}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div className={`question-container ${showQuestion?'':'hidden'}`}>
            <button onClick={() => handleButtonClick("What experience do you have in the Fintech industry?")} className="question-card">
              What experience do you have in the Fintech industry?
            </button>
            <button onClick={() => handleButtonClick("Can you assist me in automating or digitizing my inventory and supply management?")} className="question-card">
              Can you assist me in automating or digitizing my inventory and supply management?
            </button>
          </div>
          <div ref={ref}/>
        </div>
        <form onSubmit={handleMessageSubmit}>
          <textarea
              ng-trim="false"
              id='prompt'
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              style={{ height: inputHeight }}
              placeholder='Type your message...'
              rows={1}
          ></textarea>
          <button
            type='submit'
            disabled={disabled}
            id='sendQuery'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='send'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
);
};
export default App;