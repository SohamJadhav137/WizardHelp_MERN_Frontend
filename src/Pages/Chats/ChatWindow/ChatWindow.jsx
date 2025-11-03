import React, { useEffect, useState } from 'react'

import './ChatWindow.scss'
import Message from '../../../Components/Messages/Message'
import socket from '../../../socket';
import { useParams } from 'react-router-dom';

export default function ChatWindow() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { conversationId } = useParams();

  useEffect(() => {
    if(conversationId){
      socket.emit("join_conversation", conversationId);
      console.log("Frontend joined conversation at ID:",conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      console.log("New Message received:", data);
      setMessages((prev) => [...prev, data]);
    }

    socket.on("receive_message", receiveMessageHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
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

    socket.emit("send_message", data);
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
