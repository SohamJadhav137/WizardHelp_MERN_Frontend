import React, { useContext, useEffect, useState } from 'react'

import './Orders.scss';
import OrderCard from '../../Components/Orders/OrderCard';
import { getSocket } from '../../socket';
import { getCurrentUser } from '../../utils/getCurrentUser';
import { AuthContext } from '../../context/AuthContext';


export default function Orders() {
  
  const socket = getSocket();
  const [orders, setOrders] = useState([]);

  // Fetching orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("Token not found, user not logged in");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok)
          throw new Error("Failed to fetch orders!");

        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if(!socket) return;

    const handleSocketEvents = (payload) => {
      const updatedOrder = payload.updatedOrder;

      setOrders(prevOrders => prevOrders.map(order => order._id === updatedOrder._id ? updatedOrder : order));
    };

    const events = [
      "orderDelivered",
      "orderCompleted",
      "orderRevision",
      "orderCancellationRequest",
      "orderCancelAccept",
      "orderCancelReject",
      "orderCancelled"
    ];

    events.forEach(event => socket.on(event, handleSocketEvents));

    return () => {
      events.forEach(event => socket.off(event, handleSocketEvents));
    }
  }, [socket]);

  // Receive new order socket event
  useEffect(() => {
    const receiveNewOrder = (payload) => {
      setOrders(prev => [payload.createdOrder, ...prev]);
    }

    socket.on("newOrderReceive", receiveNewOrder);

    return () => {
      socket.off("newOrderReceive", receiveNewOrder);
    };
  }, []);

  return (
    <div className='orders-container'>
      <div className="orders">
        <div className="orders-page-title">
          <span>My Orders</span>
        </div>

        <div className="order-list">
          {
            orders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))
          }
        </div>
      </div>
    </div>
  )
}
