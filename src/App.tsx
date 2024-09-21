import React, { useEffect, useRef, useState } from "react";
import socket from "./sockets";
import "./App.css"; // Importing CSS for styling

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
    // Connect to the Socket.IO server
    socket.on("connect", () => {
      console.log("Connected to the server");

      // Join the default room (useful for testing)
      // socket.emit("join", { session_id: "test-room" });
    });

    // Listen for messages from the server
    socket.on("message", (data: { message: string }) => {
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { message: data.message, isSentByCurrentUser: false },
      ]);
    });

    return () => {
      socket.off("connect");
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatLog]);

  const sendMessage = () => {
    if (message) {
      // Emit a message to the server
      socket.emit("message", { session_id: "test-room", message });
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { message, isSentByCurrentUser: true },
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
      <h1>JW AI ChatBot</h1>

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
