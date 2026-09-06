import { useState } from "react";
import { Send, Bot, User, X } from "lucide-react";

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

    // Show user's message
    setMessages((prev) => [
      ...prev,
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


      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply
        }
      ]);

    }

    catch (error) {

      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn't connect to the health assistant."
        }
      ]);

    }

    finally {
      setLoading(false);
    }
  };


  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      sendMessage();
    }

  };


  return (

    <div className="chat-overlay">

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
                Online • Health Assistant
              </small>

            </div>

          </div>


          <button onClick={onClose}>
            <X size={20} />
          </button>

        </div>



        {/* MESSAGES */}

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

                {msg.text}

              </div>

            </div>

          ))}


          {loading && (

            <div className="message-row bot">

              <div className="message-icon">
                <Bot size={16} />
              </div>

              <div className="message">
                Thinking...
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
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />


          <button onClick={sendMessage}>

            <Send size={18} />

          </button>

        </div>


        <p className="chat-disclaimer">

          AI suggestions are for informational purposes and
          do not replace professional medical advice.

        </p>

      </div>

    </div>

  );
}

export default HealthChat;