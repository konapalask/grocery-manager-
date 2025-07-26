import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const categories = ["All", "Fruits", "Vegetables", "Dairy", "Bakery", "Others", "Medicine"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const initialGroceries = [
    {
      id: 1,
      name: "Milk",
      quantity: 2,
      image: "https://via.placeholder.com/60 ",
      category: "Dairy",
      stockDate: new Date().toISOString().split('T')[0],
      manufactureDate: "2025-01-01",
      expiryDate: "2025-12-31"
    },
    {
      id: 2,
      name: "Paracetamol",
      quantity: 10,
      image: "https://via.placeholder.com/60 ",
      category: "Medicine",
      stockDate: new Date().toISOString().split('T')[0],
      manufactureDate: "2024-06-01",
      expiryDate: "2025-06-01"
    }
  ];

  const [groceries, setGroceries] = useState(() => {
    const saved = localStorage.getItem('groceryList');
    return saved ? JSON.parse(saved) : initialGroceries;
  });

  // Form states
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newImage, setNewImage] = useState(null);
  const [newCategory, setNewCategory] = useState("Fruits");
  const [newStockDate, setNewStockDate] = useState(new Date().toISOString().split('T')[0]);
  const [newManufactureDate, setNewManufactureDate] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);
  const [editImage, setEditImage] = useState('');
  const [editCategory, setEditCategory] = useState("Fruits");
  const [editStockDate, setEditStockDate] = useState('');
  const [editManufactureDate, setEditManufactureDate] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  // Save groceries to localStorage
  useEffect(() => {
    localStorage.setItem('groceryList', JSON.stringify(groceries));
  }, [groceries]);

  const addGrocery = () => {
    if (!newItem.trim()) {
      alert("Please enter an item name.");
      return;
    }

    const newItemObj = {
      id: Date.now(),
      name: newItem,
      quantity: parseInt(newQuantity),
      image: newImage || "https://via.placeholder.com/60 ",
      category: newCategory,
      stockDate: newStockDate,
      manufactureDate: newManufactureDate,
      expiryDate: newExpiryDate
    };

    setGroceries([newItemObj, ...groceries]);
    resetForm();
  };

  const removeItem = (id) => {
    setGroceries(groceries.filter(item => item.id !== id));
  };

  const clearList = () => {
    if (window.confirm("Are you sure you want to clear all items?")) {
      setGroceries([]);
    }
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setEditImage(item.image);
    setEditCategory(item.category);
    setEditStockDate(item.stockDate);
    setEditManufactureDate(item.manufactureDate);
    setEditExpiryDate(item.expiryDate);
  };

  const updateGrocery = () => {
    if (!editName.trim()) {
      alert("Please enter valid name");
      return;
    }

    const updatedGroceries = groceries.map(item =>
      item.id === editingId
        ? {
            ...item,
            name: editName,
            quantity: parseInt(editQuantity),
            image: editImage,
            category: editCategory,
            stockDate: editStockDate,
            manufactureDate: editManufactureDate,
            expiryDate: editExpiryDate
          }
        : item
    );

    setGroceries(updatedGroceries);
    setEditingId(null);
    resetEditForm();
  };

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (isEdit) {
        setEditImage(e.target.result);
      } else {
        setNewImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Quantity', 'Category', 'Added On', 'Manufacture', 'Expiry'];
    const csvRows = filteredGroceries.map(item => [
      item.id,
      `"${item.name}"`,
      item.quantity,
      item.category,
      item.stockDate,
      item.manufactureDate || 'Not Set',
      item.expiryDate || 'Not Set'
    ]);

    const csvContent =
      [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'grocery-list.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return "";
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return "Expired";
    if (daysLeft <= 7) return "Expires Soon!";
    return "Good";
  };

  const filteredGroceries = groceries.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(item =>
    selectedCategory === "All" || item.category === selectedCategory
  );

  // Define missing functions
  const resetForm = () => {
    setNewItem('');
    setNewQuantity(1);
    setNewImage(null);
    setNewCategory("Fruits");
    setNewStockDate(new Date().toISOString().split('T')[0]);
    setNewManufactureDate('');
    setNewExpiryDate('');
  };

  const resetEditForm = () => {
    setEditName('');
    setEditQuantity(1);
    setEditImage('');
    setEditCategory("Fruits");
    setEditStockDate('');
    setEditManufactureDate('');
    setEditExpiryDate('');
  };

  return (
    <div className="App">
      <header>
        <h1>🛒 Grocery & Medicine Manager</h1>
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="category-filter">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-btn ${selectedCategory === cat ? 'selected-category' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Add Item */}
      {!editingId && (
        <section className="add-section">
          <h2>Add New Item</h2>
          <div className="form-group">
            <label>Product Name:</label>
            <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input type="number" min="1" value={newQuantity} onChange={(e) => setNewQuantity(parseInt(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Choose Image:</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              {categories.filter(c => c !== "All").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Added On:</label>
            <input type="date" value={newStockDate} onChange={(e) => setNewStockDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Manufacture Date:</label>
            <input type="date" value={newManufactureDate} onChange={(e) => setNewManufactureDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Expiry Date:</label>
            <input type="date" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} />
          </div>
          <button onClick={addGrocery}>Add Item</button>
        </section>
      )}

      {/* Edit Item */}
      {editingId && (
        <section className="edit-form">
          <h2>Edit Item</h2>
          <div className="form-group">
            <label>Product Name:</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input type="number" min="1" value={editQuantity} onChange={(e) => setEditQuantity(parseInt(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Choose Image:</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
              {categories.filter(c => c !== "All").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Added On:</label>
            <input type="date" value={editStockDate} onChange={(e) => setEditStockDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Manufacture Date:</label>
            <input type="date" value={editManufactureDate} onChange={(e) => setEditManufactureDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Expiry Date:</label>
            <input type="date" value={editExpiryDate} onChange={(e) => setEditExpiryDate(e.target.value)} />
          </div>
          <button onClick={updateGrocery}>Update Item</button>
        </section>
      )}

      {/* Grocery List */}
      <main>
        <ul className="grocery-list">
          {filteredGroceries.length === 0 ? (
            <p>No items found.</p>
          ) : (
            filteredGroceries.map(item => {
              const status = getExpiryStatus(item.expiryDate);
              return (
                <li key={item.id} className="grocery-item">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="item-image" />
                  )}
                  <div className="details">
                    <strong>{item.name}</strong><br />
                    Quantity: {item.quantity}<br />
                    Category: {item.category}<br />
                    Added On: {item.stockDate}<br />
                    Manufacture: {item.manufactureDate || "Not Set"}<br />
                    Expiry: {item.expiryDate || "Not Set"}<br />
                    Status: <span className={`status ${status}`}>{status}</span><br />
                    <button onClick={() => startEditing(item)}>Edit</button>
                    <button onClick={() => removeItem(item.id)}>Delete</button>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        {groceries.length > 0 && (
          <div className="actions">
            <p>Total Items: {filteredGroceries.length}</p>
            <button onClick={clearList}>Clear All</button>
            <button onClick={exportToCSV}>Export to CSV</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;