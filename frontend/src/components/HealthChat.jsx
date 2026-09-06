import { useState } from "react";
import { Send, Bot, User, X } from "lucide-react";
import FormattedText from "./FormattedText";

function HealthChat({ onClose }) {

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm your AI Health Companion. How are you feeling today?"
    }
  ]);

  const [loading, setLoading] = useState(false);


  const sendMessage = async () => {

    if (!message.trim() || loading) {
      return;
    }

    const userMessage = message.trim();

    // Add user message
    setMessages((previous) => [
      ...previous,
      {
        sender: "user",
        text: userMessage
      }
    ]);

    setMessage("");
    setLoading(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:5000/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            message: userMessage
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error("Server error");
      }


      // Add AI response
      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: data.reply
        }
      ]);

    }


    catch (error) {

      console.error("Chat error:", error);

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: "Sorry, I couldn't connect to the AI assistant."
        }
      ]);

    }


    finally {

      setLoading(false);

    }

  };


  const handleKeyDown = (event) => {

    if (event.key === "Enter") {
      sendMessage();
    }

  };


  return (

    <div
      className="chat-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >

      <div className="chat-box">


        {/* HEADER */}

        <div className="chat-header">

          <div className="chat-title">

            <div className="chat-bot-icon">
              <Bot size={21} />
            </div>

            <div>

              <strong>
                AI Health Companion
              </strong>

              <small>
                Online • LifeCare Guardian
              </small>

            </div>

          </div>


          <button
            onClick={() => onClose && onClose()}
            aria-label="Close chat"
          >
            <X size={20} />
          </button>

        </div>



        {/* CHAT */}

        <div className="chat-messages">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`message-row ${msg.sender}`}
            >

              <div className="message-icon">

                {msg.sender === "bot"
                  ? <Bot size={16} />
                  : <User size={16} />
                }

              </div>


              <div className="message">
                {msg.sender === "bot" ? (
                  <FormattedText content={msg.text} />
                ) : (
                  msg.text
                )}
              </div>

            </div>

          ))}


          {loading && (

            <div className="message-row bot thinking-row">

              <div className="message-icon">
                <Bot size={16} />
              </div>

              <div className="message thinking-bubble">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>

            </div>

          )}

        </div>



        {/* INPUT */}

        <div className="chat-input">

          <input
            type="text"
            placeholder="Tell me how you're feeling..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
          />


          <button onClick={sendMessage}>

            <Send size={18} />

          </button>

        </div>


        <p className="chat-disclaimer">

          AI information is for general guidance and does not
          replace professional medical advice.

        </p>

      </div>

    </div>

  );
}

export default HealthChat;