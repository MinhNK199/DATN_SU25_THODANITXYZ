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
    <div className={styles["recommendation-list-container"]}>
      <h2 className={styles["recommendation-title"]}>
        Sản phẩm đề xuất cho bạn
      </h2>
      <div className={styles["recommendation-list"]}>
        <div className={styles["product-grid"]}>
          {products.map((product: any) => (
            <div
              className={styles["product-card"]}
              key={product._id}
              onClick={() => navigate(`/product/${product._id}`)}
              style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            >
              <img
                src={product.images?.[0] || '/placeholder.svg'}
                alt={product.name}
                className={styles["product-image"]}
              />
              <h4 className={styles["product-name"]}>{product.name}</h4>
              <div className={styles["product-price"]}>
                {product.price?.toLocaleString()}₫
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecommendationList; 