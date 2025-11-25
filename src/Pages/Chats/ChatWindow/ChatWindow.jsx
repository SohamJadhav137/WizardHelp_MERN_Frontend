import React, { useEffect, useRef, useState } from 'react'

import './ChatWindow.scss'
import Message from '../../../Components/Messages/Message'
import { getSocket } from '../../../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from '../../../utils/getCurrentUser';

const socket = getSocket();

export default function ChatWindow() {
  const { conversationId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();
  
  const bottomRef = useRef();

  const sender = getCurrentUser();
  const senderId = sender?.id;

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const parsedUserData = JSON.parse(user);
  const currentUser = parsedUserData?.name;

  useEffect(()=> {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages]);

  useEffect(() => {
    if(!conversationId || conversationId === undefined){
      setMessages([]);
      return;
    }

    const fetchMessages = async (token) => {
      try {
        
        const response = await fetch(`http://localhost:5000/api/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if(response.ok){
          const data = await response.json();
          setMessages(data);
        }
        else{
          console.error("BACKEND RESPONSE ERROR:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch messages for provided conversation ID:", error);
      }
    }

    fetchMessages(token);

  }, [conversationId]);

  useEffect(() => {
    if(conversationId){
      socket.emit("join_conversation", conversationId);
      console.log(`💬 ${currentUser} joined conversation room ID:`,conversationId);
    }

    return () => {
      if(conversationId){
        socket.emit("leave_conversation", conversationId);
        console.log(`💬 ❌ ${currentUser} left conversation room ID:`,conversationId);
      }
    }

  }, [conversationId]);

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      console.log("Received Message:\n", data);
      console.log(`From: ${data.senderId.username}\nMessage: ${data.text}`);
      setMessages((prev) => [...prev, data]);
    }

    socket.on("receive_message", receiveMessageHandler);
    
    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, []);
  
  const handleSend = async () => {
    if(!message.trim()) return;
    
    // Some new data to be sent from client
    const msgToSend = {
      conversationId,
      senderId,
      text: message,
      currentUser
    };    
    
    socket.emit("send_message", msgToSend);
    
    setMessage("");
  };
  // console.log("Messages:\n",messages);

  const submitKeyHandler = (e) => {
    if(e.key === 'Enter'){
      handleSend();
    }
  }

  return (
    <div className='chat-window'>
      <div className="conversation-header">
        <button onClick={() => navigate('/messages')}>Close</button>
      </div>
      <div className='messages-list'>
        {
          messages.map((m, i) => (
            <Message key={i} msg={m.text} info={ m.senderId._id === senderId ? "You" : m.senderId.username }/>
          ))
        }

        <div ref={bottomRef} />
      </div>
      <div className="input-box">
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={submitKeyHandler} placeholder='Type a message...'/>
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}
