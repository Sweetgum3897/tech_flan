import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';
import { useData } from '../state/DataContext';

const ROW_HEIGHT = 48;
const LIST_HEIGHT = 480;
const SEARCH_DEBOUNCE_MS = 300;

function ItemRow({ index, style, data }) {
  const item = data[index];
  return (
    <div style={style} className="item-row">
      <Link to={`/items/${item.id}`} className="item-link">
        <span className="item-name">{item.name}</span>
        <span className="item-meta">{item.category}</span>
        <span className="item-price">${item.price.toLocaleString()}</span>
      </Link>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="skeleton-list" aria-busy="true" aria-label="Loading items">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="skeleton-row" />
      ))}
    </ul>
  );
}

function Items() {
  const { pagination, loading, error, fetchItems } = useData();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  const loadItems = useCallback(
    (q, nextPage) => {
      fetchItems({ q, page: nextPage, limit: pagination.limit });
    },
    [fetchItems, pagination.limit]
  );

  useEffect(() => {
    loadItems(search, page);
  }, [search, page, loadItems]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  const { items, total, totalPages, limit } = pagination;

  return (
    <main className="items-page">
      <header className="items-header">
        <h1>Items</h1>
        <p className="items-subtitle">{total} items available</p>
      </header>

      <div className="items-toolbar">
        <label htmlFor="item-search" className="sr-only">
          Search items
        </label>
        <input
          id="item-search"
          type="search"
          placeholder="Search by name..."
          defaultValue={search}
          onChange={handleSearchChange}
          aria-label="Search items by name"
          className="search-input"
        />
      </div>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {loading && !items.length ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <p className="empty-state">No items match your search.</p>
      ) : (
        <div className="virtual-list-wrapper" aria-label="Items list">
          <List
            height={LIST_HEIGHT}
            itemCount={items.length}
            itemSize={ROW_HEIGHT}
            width="100%"
            itemData={items}
          >
            {ItemRow}
          </List>
        </div>
      )}

      <nav className="pagination" aria-label="Pagination">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </nav>

      {loading && items.length > 0 && (
        <p className="loading-indicator" aria-live="polite">
          Updating...
        </p>
      )}
    </main>
  );
}

export default Items;
