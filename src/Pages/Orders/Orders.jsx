import React, { useContext, useEffect, useState } from 'react'

import './Orders.scss';
import OrderCard from '../../Components/Orders/OrderCard';
import { getSocket } from '../../socket';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import OrderStatusFilter from '../../Components/Orders/OrderStatusFilter';
import { AuthContext } from '../../context/AuthContext';
import { getCurrentUser } from '../../utils/getCurrentUser';
import loading_orders from '../../assets/loading_orders.lottie';
import data_not_found from '../../assets/data-not-found.lottie';
import API_BASE_URL from '../../utils/api';

export default function Orders() {

  const { user } = useContext(AuthContext);
  const socket = getSocket();
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [orderDetails, setOrderDetails] = useState({}); // Store gig and user details by orderId index
  const [searchQuery, setSearchQuery] = useState('');
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [detailsLoad, setDetailsLoad] = useState(true);

  const currentUser = getCurrentUser();

  // Fetching orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("Token not found, user not logged in");
        setOrdersLoading(false);
        setInitialLoad(false);
        return;
      }

      try {
        setOrdersLoading(true);

        const res = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok)
          throw new Error("Failed to fetch orders!");

        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setOrdersLoading(false)
        setInitialLoad(false);
      }
    };

    fetchOrders();
  }, []);

  // Fetch gig and user details for all orders
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token){
      setDetailsLoad(false);
      return;
    }

    if(orders.length === 0){
      setDetailsLoad(false);
      return;
    }

    const ordersNeedingDetails = orders.filter(
      order => !orderDetails[order._id]
    );

    if (ordersNeedingDetails.length === 0) {
      setDetailsLoad(false);
      return;
    }

    setDetailsLoad(true);

    const fetchDetailsForOrders = async () => {

      const newDetails = {};
      for (const order of ordersNeedingDetails) {
        try {
          const gigResponse = await fetch(`${API_BASE_URL}/api/gigs/${order.gigId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          let gigTitle = null;
          let coverImage = null;
          if (gigResponse.ok) {
            const gigData = await gigResponse.json();
            gigTitle = gigData.gig?.title;
            coverImage = gigData.gig?.coverImageURL;
          }

          let userDetails = null;
          let userId = null;
          if (user.role === 'seller') { userId = order.buyerId; } else { userId = order.sellerId; }

          if (userId) {
            const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
              const userData = await res.json();
              userDetails = userData.user;
            }
          }

          newDetails[order._id] = {
            gigTitle,
            coverImage,
            userDetails
          };

        } catch (error) {
          console.error(`Error fetching details for order ${order._id}:, error`);

          newDetails[order._id] = {
            gigTitle: null,
            coverImage: null,
            userDetails: null
          };
        }
      }
      
      setOrderDetails(prev => ({
        ...prev, ...newDetails
      }));

      setDetailsLoad(false);
    };

    fetchDetailsForOrders();

  }, [orders])

  // Handling orders socket events
  useEffect(() => {
    if (!socket) return;

    const handleSocketEvents = (payload) => {
      const updatedOrder = payload.updatedOrder;

      setOrders(prevOrders => prevOrders.map(order => order?._id === updatedOrder._id ? { ...order, ...updatedOrder } : order));
    };

    const events = [
      "orderInitiated",
      "orderDeclined",
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
    if (!socket) return;

    const receiveNewOrder = (payload) => {
      setOrders(prev => [payload.createdOrder, ...prev]);
    }

    socket.on("orderReceived", receiveNewOrder);

    return () => {
      socket.off("orderReceived", receiveNewOrder);
    };
  }, [socket]);

  // Order status resolved
  useEffect(() => {
    const exists =
      selectedStatus === "all" ||
      orders.some(o => o.status === selectedStatus);

    if (!exists) setSelectedStatus("all");
  }, [orders, selectedStatus]);

  // console.log(orderDetails)

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter(order => order.status === selectedStatus);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchedOrders =
    normalizedQuery === ""
      ? filteredOrders
      : filteredOrders.filter(order => {
        const gigTitle =
          orderDetails[order._id]?.gigTitle?.toLowerCase() || "";

        const fullOrderId = order._id.toLowerCase();
        const shortOrderId = order._id.slice(-6).toLowerCase();

        return (
          gigTitle.includes(normalizedQuery) ||
          shortOrderId.includes(normalizedQuery) ||
          fullOrderId.includes(normalizedQuery)
        );
      });

  return (
    <div className='orders-container'>
      <div className="orders">

        <div className="orders-page-title">
          My Orders
        </div>

        {orders.length > 0 && (<div className="orders-filter"><OrderStatusFilter orders={orders} selectedStatus={selectedStatus} onChange={setSelectedStatus} searchQuery={searchQuery} onSearchChange={setSearchQuery} /></div>)}

        {ordersLoading ? (
          /* Orders loading */
          <div className="orders-empty-text">
            <div className="gig-container">
              <DotLottieReact
                src={loading_orders}
                loop
                autoplay
                style={{ height: "150px" }}
              />
            </div>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          /* New user */
          <div className="orders-empty-text">
            <div className="gig-container">
              <DotLottieReact
                src="https://lottie.host/4902329f-05ba-429e-882a-6c2b90c883fa/DWDDPVY1Mu.lottie"
                loop
                autoplay
                style={{ height: "350px" }}
              />
            </div>
            You haven't placed any orders yet...
          </div>
        ) : detailsLoad ? (
          /* Orders loading */
          <div className="orders-empty-text">
            <div className="gig-container">
              <DotLottieReact
                src={loading_orders}
                loop
                autoplay
                style={{ height: "150px" }}
              />
            </div>
            Loading orders...
          </div>
        ) : searchedOrders.length === 0 ? (
          /* Filter/search empty */
          <div className="orders-empty-text">
            <div className="gig-container">
              <DotLottieReact
                src={data_not_found}
                loop
                autoplay
                style={{ height: "150px" }}
              />
            </div>
            No orders found.
          </div>
        ) : (
          /* Normal list */
          <div className="order-list">
            {searchedOrders.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                gigTitle={orderDetails[order._id]?.gigTitle}
                coverImage={orderDetails[order._id]?.coverImage}
                userDetails={orderDetails[order._id]?.userDetails}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
