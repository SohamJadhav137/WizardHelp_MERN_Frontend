import React, { useEffect, useRef, useState } from 'react'

import './ChatWindow.scss'
import Message from '../../../Components/Messages/Message'
import { getSocket } from '../../../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from '../../../utils/getCurrentUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export default function ChatWindow() {
  const socket = getSocket();
  const { conversationId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conv, setConv] = useState(null);
  const [recpUserDetails, setRecpUserDetails] = useState(null);

  const navigate = useNavigate();

  const bottomRef = useRef();

  const sender = getCurrentUser();
  const senderId = sender?.id;

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const parsedUserData = JSON.parse(user);
  const currentUser = parsedUserData?.username;

  // Fetch active conversation
  useEffect(() => {
    if(!conversationId) return;

    const fetchConversation = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/conversations/${conversationId}/conv`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setConv(data);
        }
        else {
          console.error("Failed to fetch single conversation:", res.status);
        }
      } catch (error) {
        console.error("Some error occured:", error);
      }
    }

    fetchConversation();
  }, [conversationId]);

  let recpUserId = null;

  if(sender.role === 'seller'){
    recpUserId = conv?.buyerId;
  }
  else if(sender.role === 'buyer'){
    recpUserId = conv?.sellerId;
  }

  // Fetch recipient user details
  useEffect(() => {
    if(!recpUserId) return;

    const fetchRecipientUserDetails = async () => {
      try{
        const res = await fetch(`http://localhost:5000/api/user/${recpUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if(!res.ok)
          return console.error("Failed to fetch recipient user ID:", res.status);
        
        const data = await res.json();
        setRecpUserDetails(data.user);
      } catch(error){
        console.error("Some error occured:", error);
      }
    };

    fetchRecipientUserDetails();
  }, [recpUserId]);

  // Scroll to last msg
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages]);

  // Fetch msgs from DB
  useEffect(() => {
    if (!conversationId || conversationId === undefined) {
      setMessages([]);
      return;
    }

    const fetchMessages = async (token) => {
      try {

        const response = await fetch(`http://localhost:5000/api/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
        else {
          console.error("BACKEND RESPONSE ERROR:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch messages for provided conversation ID:", error);
      }
    }

    fetchMessages(token);

  }, [conversationId]);

  // Join/Leave conv room
  useEffect(() => {
    if(!socket || !socket.connected) return;

    if (conversationId) {
      socket.emit("join_conversation", conversationId);
      console.log(`💬 ${currentUser} joined conversation room ID:`, conversationId);
    }

    return () => {
      if (conversationId) {
        socket.emit("leave_conversation", conversationId);
        console.log(`💬 ❌ ${currentUser} left conversation room ID:`, conversationId);
      }
    }

  }, [conversationId, socket]);

  // Receive msg socket
  useEffect(() => {
    if(!socket) return;
    
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

  // Send msg socket
  const handleSend = async () => {
    if(!socket) return;
    
    if (!message.trim()) return;

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

  // Send msg handler
  const submitKeyHandler = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }

  return (
    <div className='chat-window'>
      {
        conversationId &&
        <div className="conversation-header">
              <div className="conversation-profile-container">
                <div className="conv-profile">
                  <div className="conv-profile-main">
                    <img src={recpUserDetails?.profilePic || '/profile.png'} alt="" />
                  </div>
                  <div className="conv-profile-detials">
                    <div className="profile-username">
                      {recpUserDetails?.username}
                    </div>
                  </div>
                </div>
                <button onClick={() => navigate('/messages')} className='close-chat-btn'>
                  Close<FontAwesomeIcon icon="fa-solid fa-xmark"/>
                </button>
              </div>
        </div>
      }
      <div className='messages-list'>
        {
          !conversationId ?
            <div className="no-chat-selected-text">
              Select a chat to view messages
            </div>
            :
            messages.map((m, i) => (
              <Message key={i} msg={m} info={m.senderId._id === senderId ? "You" : m.senderId.username} recpPrfPic={recpUserDetails?.profilePic} />
            ))
        }

        <div ref={bottomRef} />
      </div>
      {
        conversationId &&
        <div className="input-box">
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={submitKeyHandler} placeholder='Type a message...' className='input-text-field'/>
          <button onClick={handleSend}>
            <FontAwesomeIcon icon="fa-solid fa-paper-plane" />
          </button>
        </div>
      }
    </div>
  )
}
