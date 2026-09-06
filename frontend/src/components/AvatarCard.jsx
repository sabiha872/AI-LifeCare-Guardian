import { Bot, MessageSquare } from "lucide-react";

function AvatarCard({ onOpenChat, onGoToAvatar }) {
  return (
    <div className="avatar-section">
      <div className="avatar">
        <div className="avatar-image">
          🤖
        </div>

        <div className="avatar-content">
          <span className="avatar-label">AI HEALTH GUARDIAN</span>
          <h2>Meet Your AI Health Guardian</h2>
          <p>
            An intelligent health assistant that can analyze your expressions,
            listen to your concerns, and provide personalized wellness guidance.
          </p>

          <div className="avatar-actions">
            <button className="talk-button" onClick={onGoToAvatar}>
              <Bot size={16} /> Talk to Avatar
            </button>
            <button className="chat-button" onClick={onOpenChat}>
              <MessageSquare size={16} /> Chat with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarCard;