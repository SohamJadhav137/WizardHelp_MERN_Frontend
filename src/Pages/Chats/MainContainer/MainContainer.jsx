import React, { useEffect, useState } from 'react'

import './MainContainer.scss'
import ChatsContainer from '../ChatsContainer/ChatsContainer'
import ChatWindow from '../ChatWindow/ChatWindow'
import { useNavigate, useParams } from 'react-router-dom'
import { getSocket } from '../../../socket'

export default function MainContainer() {
  
  const [convList, setConvList] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const q = searchQuery.toLowerCase().trim();

  const starts = [];
  const contains = [];

  convList.forEach(conv => {
    const name = conv.buyerName?.toLowerCase() || conv.sellerName?.toLowerCase();

    if(!q || name.startsWith(q)){
      starts.push(conv);
    } else if (name.includes(q)){
      contains.push(conv);
    }
  });

  const filteredConvList = q ? [...starts, ...contains] : convList;

  const handleSelectedConv = (conv) => {
    if (conv) {
      navigate(`/messages/${conv}`);
    }
  }

  // Fetch conversations
  useEffect(() => {
    const fetchConverstaions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json();
          setConvList(data);
        }
        else {
          console.error("BACKEND RESPONSE ERROR:", response);
        }
      } catch (error) {
        console.error("Failed to fetch existing conversations\nError:", error);
      }
    }

    fetchConverstaions();
  }, []);

  // Updates last msg in chat bubble
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleLastMessageUpdate = ({ conversationId, lastMessage, updatedAt }) => {
      setConvList(prev => prev.map(
        conv => conv._id === conversationId ?
          { ...conv, lastMessage, updatedAt }
          :
          conv
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    };

    socket.on('last_message_update', handleLastMessageUpdate);

    return () => {
      socket.off('last_message_update', handleLastMessageUpdate);
    };
  }, []);

  return (
    <div className='chat-app'>
      {/* <div className="messages-website-title">
        <div className="messages-website-title-container">
        <span>Messages</span>
        </div>
      </div> */}
      <div className='chat-app-container'>
        <ChatsContainer convList={filteredConvList} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelectConversation={handleSelectedConv} />
        <ChatWindow />
      </div>
    </div>
  )
}
