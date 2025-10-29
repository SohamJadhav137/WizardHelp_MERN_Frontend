import React, { useEffect, useState } from 'react'

import './ChatWindow.scss'
import Message from '../../../Components/Messages/Message'
import socket from '../../../socket';

export default function ChatWindow() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      console.log("New Message received:", data);
      setMessages((prev) => [...prev, data]);
    }

    socket.on("receiveMessage", receiveMessageHandler);

    return () => {
      socket.off("receiveMessage", receiveMessageHandler);
    };
  }, []);

  const handleSend = () => {
    if(!message.trim()) return;

    // Some new data to be sent from client
    const data = {
      conversationId: "t111",
      senderId: "user1",
      text: message
    };

    socket.emit("sendMessage", data);
    // setMessages((prev) => [...prev, data]);
    setMessage("");
  };

  return (
    <div className='chat-window'>
      <div className='messages-list'>
        {
          messages.map((m, i) => (
            <Message key={i} msg={m.text}/>
          ))
        }
      </div>
      <div className="input-box">
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Type a message...'/>
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}
