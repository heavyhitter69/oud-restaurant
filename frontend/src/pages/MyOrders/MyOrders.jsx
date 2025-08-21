import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets';
import axios from 'axios';
import TrackOrderPopup from '../../components/TrackOrderPopup/TrackOrderPopup';

const MyOrders = () => {

    const {url,token} = useContext(StoreContext);
    const [data,setData] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);


    const fetchOrders = async () => {
        try {
            const response = await axios.post(url+"/api/order/userorders",{},{headers:{token}});
            const orders = response.data.data;
            console.log("Raw orders:", orders);
            
            // Remove duplicates if any
            const uniqueOrders = orders.filter((order, index, self) => 
                index === self.findIndex(o => o._id === order._id)
            );
            
            // Sort by date (newest first) to ensure proper ordering
            const sortedOrders = uniqueOrders.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                console.log(`Comparing: ${a._id} (${dateA}) vs ${b._id} (${dateB})`);
                return dateB - dateA;
            });
            
            console.log("Sorted orders:", sortedOrders);
            setData(sortedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    }

    const handleTrackOrder = async (order) => {
        // Fetch the latest order status before opening the popup
        try {
            const response = await axios.post(url+"/api/order/userorders",{},{headers:{token}});
            if (response.data.success) {
                const updatedOrder = response.data.data.find(o => o._id === order._id);
                if (updatedOrder) {
                    setSelectedOrder(updatedOrder);
                } else {
                    setSelectedOrder(order);
                }
            } else {
                setSelectedOrder(order);
            }
        } catch (error) {
            console.error('Error fetching updated order:', error);
            setSelectedOrder(order);
        }
    }

    useEffect(()=>{
        if (token) {
            fetchOrders();
        }
    },[token])

    // Refresh orders every 30 seconds
    useEffect(() => {
        if (token) {
            const interval = setInterval(fetchOrders, 30000);
            return () => clearInterval(interval);
        }
    }, [token, url]);


  return (
    <div className='my-orders'>
      <div className="my-orders-header">
        <h1>My Orders</h1>
        <p>Track your order history and current deliveries</p>
      </div>
      
      <div className="container">
        {data.map((order,index)=>{
            return (
                <div key={index} className='my-orders-order'>
                    <img src={assets.parcel_icon} alt="" />
                    <p>{order.items.map((item,index)=>{
                        if (index === order.items.length-1) {
                            return item.name+" x "+item.quantity
                        }
                        else{
                            return item.name+" x "+item.quantity+", "
                        }
                    })}</p>
                    <p>₵{order.amount}.00</p>
                    <p>Items: {order.items.length}</p>
                    <p><span>&#x25cf;</span> <b>{order.status}</b></p>
                    <button onClick={() => handleTrackOrder(order)}>Track Order</button>
                </div>
            )
        })}
      </div>
      
      {selectedOrder && (
        <TrackOrderPopup 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  )
}

export default MyOrders
