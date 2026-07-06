import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';
import '../styles/app.css';

function App() {
  return (
    <DataProvider>
      <div className="app-shell">
        <nav className="app-nav" aria-label="Main navigation">
          <Link to="/" className="brand">
            Item Catalog
          </Link>
        </nav>
        <Routes>
          <Route path="/" element={<Items />} />
          <Route path="/items/:id" element={<ItemDetail />} />
        </Routes>
      </div>
    </DataProvider>
  );
}

export default App;
