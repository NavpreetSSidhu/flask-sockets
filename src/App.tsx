import React, { useEffect, useRef, useState } from "react";
import "./App.css"; // Importing CSS for styling
import axios from "axios";

interface MessageProps {
  message: string;
  isSentByCurrentUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isSentByCurrentUser }) => {
  const formatMessageWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={isSentByCurrentUser ? "message sent" : "message received"}>
      {formatMessageWithLinks(message)}
    </div>
  );
};

const App: React.FC = () => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<
    { message: string; isSentByCurrentUser: boolean }[]
  >([]);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatLog]);

  const getBotResponse = async (userMessage: string) => {
  try {
    const response = await axios.post(
      "http://localhost:3001/api/v1/hippo/chat-bot",
      {
        business_id: 1,
        channel_id: "7475",
        message: userMessage,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hdnByZWV0LnNpbmdoQGp1bmdsZXdvcmtzLmNvbSIsImV4cCI6MTgxOTM4MDg3N30.LdKWD-aTb9zh5uoxPdHyGeCc_4ONr7wph7aAMFJEftI",
        },
      }
    );

    if (response.data.success) {
      return response.data.data.bot_output; // Adjusted to the correct path
    } else {
      console.error("API error:", response.data.message);
      return "Sorry, I couldn't process that.";
    } // Adjust based on the API response structure
  } catch (error) {
    console.error("Error fetching chatbot response:", error);

    if (axios.isAxiosError(error) && error.response) {
      // Handle specific API errors if necessary
      console.error("API Error:", error.response.data);
      return error.response.data.message || "Sorry, I couldn't process that.";
    }

    return "An error occurred while fetching the response.";
  }
};

  const sendMessage = async () => {
    if (message) {
      // Add user's message to the chat log
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { message, isSentByCurrentUser: true },
      ]);

      // Fetch chatbot response
      const botResponse = await getBotResponse(message);

      // Add chatbot's response to the chat log
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { message: botResponse, isSentByCurrentUser: false },
      ]);

      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="App">
      <h1>AI ChatBot</h1>

      <div className="chat-box" ref={chatBoxRef}>
        {chatLog.map((msg, index) => (
          <Message
            key={index}
            message={msg.message}
            isSentByCurrentUser={msg.isSentByCurrentUser}
          />
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="message-input"
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
