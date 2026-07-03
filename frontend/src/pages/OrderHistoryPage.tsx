import React from 'react';
import { motion } from 'framer-motion';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import './Pages.css';
import './OrderHistory.css';

interface OrderHistoryPageProps {
  onShopClick: () => void;
}

const statusColor: Record<string, string> = {
  Processing: '#C41E3A',
  Shipped: '#0A0A0A',
  Delivered: '#16a34a',
};

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onShopClick }) => {
  const { orders } = useOrders();
  const { user } = useAuth();

  return (
    <div className="page order-history-page">
      <div className="page-hero">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="page-label">Your Account</div>
          <h1 className="page-title">Order<br />History.</h1>
          <p className="page-sub">
            {user ? `Welcome back, ${user.name.split(' ')[0]}. Here's everything you've ordered.` : 'Track and manage your orders.'}
          </p>
        </motion.div>
      </div>

      {orders.length === 0 ? (
        <motion.div
          className="orders-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="orders-empty-icon">○</div>
          <h3>No orders yet</h3>
          <p>When you place an order, it'll show up here.</p>
          <button className="orders-shop-btn" onClick={onShopClick}>Start Shopping</button>
        </motion.div>
      ) : (
        <div className="orders-list">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              className="order-card"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <div className="order-card-header">
                <div>
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-date">{order.date}</div>
                </div>
                <span
                  className="order-status"
                  style={{ color: statusColor[order.status], borderColor: statusColor[order.status] }}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div className="order-item" key={idx}>
                    <span className="order-item-emoji">{item.product.emoji}</span>
                    <div className="order-item-info">
                      <span className="order-item-name">{item.product.title} {item.product.titleLine2}</span>
                      <span className="order-item-meta">Size {item.size} · Qty {item.quantity}</span>
                    </div>
                    <span className="order-item-price">
                      ₹{((item.product.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="order-address">
                  <span className="order-address-label">Delivery Address</span>
                  <span className="order-address-value">{order.address}</span>
                </div>
                <div className="order-total">
                  <span className="order-total-label">Total</span>
                  <span className="order-total-value">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
