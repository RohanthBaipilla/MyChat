import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Toaster, toast } from 'react-hot-toast';
import { generateContent } from './api';
import { FaPaperclip, FaPaperPlane, FaMoon, FaSun } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download } from 'lucide-react';
import { HfInference } from '@huggingface/inference';

const client = new HfInference("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");

const CodeBlock = ({ text }) => {
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [darkMode] = useState(false);
  const theme = darkMode ? tomorrow : oneLight;
  
  const codeLines = text.split('\n');
  const detectedLang = codeLines[0].match(/^[a-zA-Z]+$/) ? codeLines[0].toLowerCase() : 'javascript';
  const codeContent = codeLines.length > 1 ? codeLines.slice(1).join('\n') : text;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(codeContent);
    setCopyStatus('✓ Copied!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

  return (
    <div className={`code-block-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="code-block-header">
        <span className="code-language">{detectedLang}</span>
        <button className="btn-copy" onClick={handleCopyMessage}>
          {copyStatus}
        </button>
      </div>
      <SyntaxHighlighter 
        language={detectedLang}
        style={theme}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 10px 10px',
          padding: '15px'
        }}
      >
        {codeContent}
      </SyntaxHighlighter>
    </div>
  );
};

const ImageWithDownload = ({ imageUrl }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  return (
    <div className="image-container">
      <img src={imageUrl} alt="Generated" className="generated-image" />
      <button className="download-button-hover" onClick={handleDownload}>
        <Download size={20} />
      </button>
    </div>
  );
};

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [gradient, setGradient] = useState({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    document.title = "MyAIBot";
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const generateImage = async (prompt) => {
    try {
      setGeneratingImage(true);
      
      const enhancedPrompt = `High quality, detailed image of ${prompt}. Professional photography, 4K, sharp focus, highly detailed`;
      
      const result = await client.textToImage({
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        inputs: enhancedPrompt,
        parameters: {
          num_inference_steps: 30,
          guidance_scale: 7.5,
          negative_prompt: "blurry, low quality, distorted, deformed, ugly, bad anatomy",
          width: 1024,
          height: 1024,
          seed: Math.floor(Math.random() * 1000000)
        }
      });

      return URL.createObjectURL(result);
    } catch (err) {
      console.error('Image generation error:', err);
      throw new Error('Failed to generate image');
    } finally {
      setGeneratingImage(false);
    }
  };

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

      if (trimmedMessage.toLowerCase().startsWith('generate image') || trimmedMessage.toLowerCase().startsWith('create image'))  {
        const imagePrompt = trimmedMessage
    .toLowerCase()
    .replace(/^(generate|create)\s+image\s+/i, '')
    .trim();
        if (!imagePrompt) {
          toast.error("Please provide an image prompt");
          return;
        }

        try {
          const imageUrl = await generateImage(imagePrompt);
          const botMessage = {
            type: 'bot',
            text: [{
              type: 'text', 
              content: `<div class="image-prompt-text">${imagePrompt.toUpperCase()}</div>`
            }],
            imageUrl: imageUrl
          };
          setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
          console.error('Image generation error:', error);
          toast.error("Failed to generate image");
        }
      } else {
        const aiResponse = await generateContent(trimmedMessage, imageFiles);
        const botMessage = { text: formatBotMessage(aiResponse), type: 'bot' };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Network Error (offline)");
    } finally {
      setLoading(false);
    }
  };

  const formatBotMessage = (text) => {
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, (match, p1) => `<strong>${p1}</strong>`);
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
    <div className={`App ${darkMode ? 'dark' : 'light'}`} 
         onMouseMove={handleMouseMove} 
         style={{ '--x': `${gradient.x}%`, '--y': `${gradient.y}%` }}>
      <div className="title-container">
        <h1>ㅤㅤㅤMyAIBot</h1>
        <img src="favicon.ico" alt="Chatbot Logo" className="chatbot-logo" style={{ verticalAlign: 'top' }} />
        <button 
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
      <div className="container">
        <div className="chat-container" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`chat-item ${message.type === 'user' ? 'user-input' : 'bot-output'}`}>
              {message.imageUrl ? (
                message.type === 'bot' ? (
                  <div className="bot-message">
                    {/* <img src="favicon.ico" alt="bot-logo" className="messagelogo bot-logo" /> */}
                    <div className="chat-text">
                      {message.text.map((part, partIndex) => (
                        <span key={partIndex} dangerouslySetInnerHTML={{ __html: part.content }}></span>
                      ))}
                      <ImageWithDownload imageUrl={message.imageUrl} />
                    </div>
                  </div>
                ) : (
                  <img src={message.imageUrl} alt="Uploaded" className="uploaded-image" />
                )
              ) : (
                <>
                  {message.type === 'bot' && (
                    <div className="bot-message">
                      {/* <img src="favicon.ico" alt="bot-logo" className="messagelogo bot-logo" /> */}
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
            placeholder="Generate Prompts,Images,Codes,Extract text from image....."
          />
          <button type="submit" className="btn-send" disabled={loading || generatingImage}>
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