// import React, { useState, useEffect, useRef } from 'react';
// import './App.css';
// import { Toaster, toast } from 'react-hot-toast';
// import { generateContent } from './api';
// import { FaRegCopy, FaPaperclip, FaPaperPlane } from 'react-icons/fa';
// import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// const CodeBlock = ({ text }) => {
//   const handleCopyMessage = () => {
//     navigator.clipboard.writeText(text);
//     toast.success("Message copied");
//   };

//   return (
//     <div className="code-block">
//       <pre>{text}</pre>
//       <button className="btn-copy" onClick={handleCopyMessage}>Copy Code</button>
//     </div>
//   );
// };

// function App() {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [imageFiles, setImageFiles] = useState([]);
//   const [gradient, setGradient] = useState({ x: 0, y: 0 });
//   const chatContainerRef = useRef(null);

//   useEffect(() => {
//     document.title = "MyChat";
//   }, []);

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [messages, loading]);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();

//     const trimmedMessage = inputMessage.trim();
//     if (trimmedMessage === '') {
//       toast.error("Type your message");
//       return;
//     }

//     try {
//       setLoading(true);

//       const newMessage = { text: trimmedMessage, type: 'user' };
//       setMessages(prevMessages => [...prevMessages, newMessage]);
//       setInputMessage('');

//       const aiResponse = await generateContent(trimmedMessage, imageFiles);

//       const botMessage = { text: formatBotMessage(aiResponse), type: 'bot' };
//       setMessages(prevMessages => [...prevMessages, botMessage]);
      
//     } catch (error) {
//       console.error('Error:', error);
//       toast.error("Network Error (offline)");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatBotMessage = (text) => {
//     // Remove ** markers and keep necessary bold
//     const formattedText = text.replace(/\*\*(.*?)\*\*/g, (match, p1) => `<strong>${p1}</strong>`);
//     // Handle code blocks
//     const codeBlockRegex = /```([^`]+)```/g;
//     const parts = formattedText.split(codeBlockRegex).map((part, index) => {
//       if (index % 2 === 1) {
//         return { type: 'code', content: part.trim() };
//       }
//       return { type: 'text', content: part };
//     });
//     return parts;
//   };

//   const handleFileInputChange = (e) => {
//     const files = Array.from(e.target.files);
//     setImageFiles(files);

//     const imageMessages = files.map(file => ({
//       type: 'user',
//       imageUrl: URL.createObjectURL(file)
//     }));
//     setMessages(prevMessages => [...prevMessages, ...imageMessages]);
//   };

//   const handleMouseMove = (e) => {
//     const x = (e.clientX / window.innerWidth) * 100;
//     const y = (e.clientY / window.innerHeight) * 100;
//     setGradient({ x, y });
//   };

//   const handleClear = () => {
//     setMessages([]);
//     setInputMessage('');
//     setImageFiles([]);
//     toast.success("Chat Cleared");
//   };

//   return (
//     <div className="App" onMouseMove={handleMouseMove} style={{ '--x': `${gradient.x}%`, '--y': `${gradient.y}%` }}>
//       <div className="title-container">
//         <h1>MyChat</h1>
//         <img src="favicon.ico" alt="Chatbot Logo" className="chatbot-logo" />
//       </div>
//       <div className="container">
//         <div className="chat-container" ref={chatContainerRef}>
//           {messages.map((message, index) => (
//             <div key={index} className={`chat-item ${message.type === 'user' ? 'user-input' : 'bot-output'}`}>
//               {message.imageUrl ? (
//                 <img src={message.imageUrl} alt="Uploaded" className="uploaded-image" />
//               ) : (
//                 <>
//                   {message.type === 'bot' && (
//                     <div className="bot-message">
//                       <img src="favicon.ico" alt="bot-logo" className="message-logo bot-logo" />
//                       <div className="chat-text">
//                         {message.text.map((part, partIndex) => (
//                           part.type === 'code' ? (
//                             <CodeBlock key={partIndex} text={part.content} />
//                           ) : (
//                             <span key={partIndex} dangerouslySetInnerHTML={{ __html: part.content }}></span>
//                           )
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                   {message.type === 'user' && (
//                     <div className="user-message">
//                       <pre className="chat-text">{message.text}</pre>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           ))}
//           {loading && (
//             <div id="load">
//               <div>G</div>
//               <div>N</div>
//               <div>I</div>
//               <div>D</div>
//               <div>A</div>
//               <div>O</div>
//               <div>L</div>
//             </div>
//           )}
//         </div>
//         <form onSubmit={handleSendMessage} className="form-container">
//           <label className="file-input-wrapper">
//             <input
//               type="file"
//               accept=".png, .jpeg, .jpg"
//               multiple
//               onChange={handleFileInputChange}
//               style={{ display: 'none' }}
//             />
//             <span className="file-input-button">
//               <FaPaperclip />
//             </span>
//           </label>
//           <input
//             type="text"
//             className="input-message"
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             placeholder="Type your message here..."
//           />
//           <button type="submit" className="btn-send">
//             <FaPaperPlane />
//           </button>
//           <button type="button" className="btn-clear" onClick={handleClear}>Clear Chat</button>
//         </form>
//       </div>
//       <Toaster position="top-right" />
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Toaster, toast } from 'react-hot-toast';
import { generateContent } from './api';
import { FaRegCopy, FaPaperclip, FaPaperPlane } from 'react-icons/fa';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';


const CodeBlock = ({ text }) => {
  const [copyStatus, setCopyStatus] = useState('Copy Code');

  const handleCopyMessage = () => {
    const lines = text.split('\n');
    const contentToCopy = lines.length === 1 ? text : lines.slice(1).join('\n');
    navigator.clipboard.writeText(contentToCopy);
    setCopyStatus('✓ Copied');

    // Reset copy status after a short delay
    setTimeout(() => setCopyStatus('Copy Code'), 3000);
  };

  return (
    <div className="code-block">
      <pre>{text}</pre>
      <button className="btn-copy" onClick={handleCopyMessage}>{copyStatus}</button>
    </div>
  );
};
function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [gradient, setGradient] = useState({ x: 0, y: 0 });
  const chatContainerRef = useRef(null);

  useEffect(() => {
    document.title = "MyChat";
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage === '') {
      toast.error("Enter your prompt");
      return;
    }

    try {
      setLoading(true);

      const newMessage = { text: trimmedMessage, type: 'user' };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputMessage('');

      const aiResponse = await generateContent(trimmedMessage, imageFiles);

      const botMessage = { text: formatBotMessage(aiResponse), type: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error("Network Error (offline)");
    } finally {
      setLoading(false);
    }
  };

  const formatBotMessage = (text) => {
    // Remove ** markers and keep necessary bold
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, (match, p1) => `<strong>${p1}</strong>`);
    // Handle code blocks
    const codeBlockRegex = /```([^`]+)```/g;
    const parts = formattedText.split(codeBlockRegex).map((part, index) => {
      if (index % 2 === 1) {
        return { type: 'code', content: part.trim() };
      }
      return { type: 'text', content: part };
    });
    return parts;
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    const imageMessages = files.map(file => ({
      type: 'user',
      imageUrl: URL.createObjectURL(file)
    }));
    setMessages(prevMessages => [...prevMessages, ...imageMessages]);
  };

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setGradient({ x, y });
  };

  const handleClear = () => {
    setMessages([]);
    setInputMessage('');
    setImageFiles([]);
    toast.success("Chat Cleared");
  };

  return (
    <div className="App" onMouseMove={handleMouseMove} style={{ '--x': `${gradient.x}%`, '--y': `${gradient.y}%` }}>
      <div className="title-container">
        <h1>ㅤㅤㅤMyChat</h1>
        <img src="favicon.ico" alt="Chatbot Logo" className="chatbot-logo" style={{ verticalAlign: 'top' }} />
      </div>
      <div className="container">
        <div className="chat-container" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`chat-item ${message.type === 'user' ? 'user-input' : 'bot-output'}`}>
              {message.imageUrl ? (
                <img src={message.imageUrl} alt="Uploaded" className="uploaded-image" />
              ) : (
                <>
                  {message.type === 'bot' && (
                    <div className="bot-message">
                      <img src="favicon.ico" alt="bot-logo" className="messagelogo bot-logo" />
                      <div className="chat-text">
                        {message.text.map((part, partIndex) => (
                          part.type === 'code' ? (
                            <CodeBlock key={partIndex} text={part.content} />
                          ) : (
                            <span key={partIndex} dangerouslySetInnerHTML={{ __html: part.content }}></span>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                  {message.type === 'user' && (
                    <div className="user-message">
                      <pre className="chat-text">{message.text}</pre>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {loading && (
            <div id="load">
              <div>G</div>
              <div>N</div>
              <div>I</div>
              <div>D</div>
              <div>A</div>
              <div>O</div>
              <div>L</div>
            </div>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="form-container">
          <label className="file-input-wrapper">
            <input
              type="file"
              accept=".png, .jpeg, .jpg"
              multiple
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
            <span className="file-input-button">
              <FaPaperclip />
            </span>
          </label>
          <input
            type="text"
            className="input-message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
          />
          <button type="submit" className="btn-send">
            <FaPaperPlane />
          </button>
          <button type="button" className="btn-clear" onClick={handleClear}>Clear Chat</button>
        </form>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;

