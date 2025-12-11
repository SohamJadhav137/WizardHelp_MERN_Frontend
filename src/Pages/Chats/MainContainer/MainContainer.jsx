import React, { useEffect, useState } from 'react'

import './MainContainer.scss'
import ChatsContainer from '../ChatsContainer/ChatsContainer'
import ChatWindow from '../ChatWindow/ChatWindow'
import { useNavigate, useParams } from 'react-router-dom'

export default function MainContainer() {

  // const convId = useParams();
  const [convList, setConvList] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleSelectedConv = (conv) => {
    if(conv){
      setSelectedConvId(conv);
      navigate(`/messages/${conv}`);
    }
    else{
      navigate('/messages');
    }
  }

  // Fetch conversations
  useEffect(() => {
    const fetchConverstaions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/conversations`, {
          headers: { Authorization: `Bearer ${token}`}
        })
        
        if(response.ok){
          const data = await response.json();
          setConvList(data);
        }
        else{
          console.error("BACKEND RESPONSE ERROR:", response);
        }
      } catch (error) {
        console.error("Failed to fetch existing conversations\nError:", error);
      }
    }

    fetchConverstaions();
  }, []);

  return (
    <div className='chat-app'>
      {/* <div className="messages-website-title">
        <div className="messages-website-title-container">
        <span>Messages</span>
        </div>
      </div> */}
      <div className='chat-app-container'>
      <ChatsContainer convList = {convList} onSelectConversation={handleSelectedConv} />
      <ChatWindow conversationId={selectedConvId} />
      </div>
    </div>
  )
}
