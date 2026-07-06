import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    fetch(`/api/items/${id}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (!controller.signal.aborted) {
          setItem(data);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          navigate('/');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="detail-page" aria-busy="true">
        <div className="skeleton-detail" />
      </div>
    );
  }

  if (!item) return null;

  return (
    <article className="detail-page">
      <h2>{item.name}</h2>
      <dl className="detail-list">
        <div>
          <dt>Category</dt>
          <dd>{item.category}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>${item.price.toLocaleString()}</dd>
        </div>
      </dl>
    </article>
  );
}

export default ItemDetail;
