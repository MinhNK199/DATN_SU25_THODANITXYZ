import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './RecommendationList.module.css';
import { useNavigate } from 'react-router-dom';

function RecommendationList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/recommendation', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className={styles["recommendation-list"]}>
      <h2 style={{marginBottom: 16}}>Sản phẩm dành cho bạn</h2>
      <div className={styles["product-grid"]}>
        {products.map((product: any) => (
          <div
            className={styles["product-card"]}
            key={product._id}
            onClick={() => navigate(`/product/${product._id}`)}
            style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          >
            <img
              src={product.images?.[0] || '/default-product.png'}
              alt={product.name}
              style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8, background: '#f5f5f5' }}
            />
            <h4 style={{ fontWeight: 600, fontSize: 16, margin: '8px 0 4px' }}>{product.name}</h4>
            <div style={{ color: '#1976d2', fontWeight: 500, fontSize: 15 }}>
              {product.price?.toLocaleString()}₫
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendationList; 