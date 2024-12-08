"use client";

import { useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import classes from './page.module.css';

export default function Page() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");

  return (
    <div>
      <div>
        <input
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          className={classes["chat-input"]}
          placeholder="Messages.."
        />
        <button
          onClick={() => {
            if (message.trim()) {
              sendMessage(message);
              setMessage(""); // Clear input after sending
            }
          }}
          className={classes["button"]}
        >
          Send
        </button>
      </div>
      <div>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
