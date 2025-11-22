import React, { useEffect, useState } from 'react'

import './Orders.scss';
import OrderCard from '../../Components/Orders/OrderCard';

export default function Orders() {

  const [orders, setOrders] = useState([]);

  // Fetching orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if(!token){
        console.log("Token not found, user not logged in");
        return;
      }

      try{
        const res = await fetch("http://localhost:5000/api/orders", {
          headers: { "Authorization": `Bearer ${token}`}
        });

        if(!res.ok)
          throw new Error("Failed to fetch orders!");
        
        const data = await res.json();
        setOrders(data);
      } catch(error){
        console.error(error);
      }
    };

    fetchOrders();
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
              <OrderCard key={order._id} order={order}/>
            ))
          }
        </div>
      </div>
    </div>
  )
}
