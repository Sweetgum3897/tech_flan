import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const DataContext = createContext();

const defaultPagination = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export function DataProvider({ children }) {
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchItems = useCallback(async ({ q = '', page = 1, limit = 20 } = {}) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page, limit });
      if (q) params.set('q', q);

      const res = await fetch(`/api/items?${params}`, { signal: controller.signal });

      if (!res.ok) {
        throw new Error('Failed to load items');
      }

      const json = await res.json();

      if (!controller.signal.aborted) {
        setPagination(json);
      }
    } catch (err) {
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  return (
    <DataContext.Provider value={{ pagination, loading, error, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
