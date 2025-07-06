import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './RecommendationList.module.css';

function RecommendationList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/api/recommendation', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className={styles["recommendation-list"]}>
      <h2>Sản phẩm dành cho bạn</h2>
      <div className={styles["product-grid"]}>
        {products.map(product => (
          <div className={styles["product-card"]} key={product._id}>
            <img src={product.images?.[0]} alt={product.name} style={{width: '100%', height: 160, objectFit: 'cover'}} />
            <h4>{product.name}</h4>
            <p>{product.price?.toLocaleString()}₫</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendationList; 