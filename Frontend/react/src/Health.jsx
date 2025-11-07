import { useState } from "react";
import "./Health.css";

export default function Health() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    setInput("");

    try {
      const response = await fetch("http://localhost:5000/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: input }),
      });
      const data = await response.json();

      // Add bot response to chat
      const botMessage = {
        text: data.error ? data.error : JSON.stringify(data, null, 2),
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { text: "Error connecting to backend.", sender: "bot" },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-background">
      <div className="chat-box">
        <div className="messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
              {msg.text}
            </div>
          ))}

          {loading && <div className="bot-message">Checking...</div>}
        </div>

        <form className="input-area" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Hello, How can I help?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">↑</button>
        </form>
      </div>
    </div>
  );
}
