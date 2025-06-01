import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaTag, FaImage, FaRegSquare, FaSpinner, FaExclamationCircle, FaPlus, FaTimes } from 'react-icons/fa';
import '../styles/shop.css';
import axiosInstance from '../utils/api';
import { IoColorFill } from 'react-icons/io5';

const Shop = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState({});
  const [userItem, setUserItem] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    price: '',
    type: 'FRAME',
    image: null
  });
  const [uploading, setUploading] = useState(false);

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/shop');
      const userItemData = await getUserItem();
      setUserItem(userItemData.data);
      console.log('User items fetched:', userItemData.data);

      // Fetch user role
      await fetchUserRole();
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Shop items fetched:', data);
      
      if (data.data && Array.isArray(data.data)) {
        setItems(data.data);
      } else if (Array.isArray(data)) {
        setItems(data);
      } else {
        throw new Error('Invalid response format');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching shop items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64); 
      const payload = JSON.parse(payloadJson);
      const role = payload.role; 
      setUserRole(role); 

      console.log("User role:", role);
    } catch (err) {
      console.error("Error decoding access token:", err);
    }
  };


  useEffect(() => {
    fetchShopItems();
  }, []);

  const getUserItem = async () => {
    try {
      const response = await axiosInstance.get(`http://localhost:3000/shop/user-items`);
      return response.data;
    } catch (err) {
      console.error('Error fetching user item:', err);
      return null;
    }
  }

  const handlePurchase = async (item) => {
    setPurchasing(prev => ({ ...prev, [item.id]: true }));
    try {
      await axiosInstance.post(`http://localhost:3000/shop/buy-item/${item.id}`);
      alert('Mua sản phẩm thành công!');
      
      setUserItem(prevUserItems => {
        if (prevUserItems) {
          return [...prevUserItems, { itemId: item.id }];
        } else {
          return [{ itemId: item.id }];
        }
      });
      
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Lỗi khi mua sản phẩm');
    } finally {
      setPurchasing(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.name || !uploadForm.price || !uploadForm.image) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', uploadForm.name);
      formData.append('price', uploadForm.price);
      formData.append('type', uploadForm.type);
      formData.append('imageUrl', `/uploads/items/${uploadForm.image.name}`);
      formData.append('description', "");
      formData.append('image', uploadForm.image);

      await axiosInstance.post('http://localhost:3000/shop', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Upload thành công!');
      setShowUploadModal(false);
      setUploadForm({ name: '', price: '', type: 'FRAME', image: null });
      fetchShopItems(); // Refresh the items list
    } catch (err) {
      console.error('Upload error:', err);
      alert('Lỗi khi upload item');
    } finally {
      setUploading(false);
    }
  };

  const getTypeIcon = (type) => {
    return type === 'FRAME' ? <FaRegSquare className="icon-sm" /> : <FaImage className="icon-sm" />;
  };

  const getTypeColor = (type) => {
    return type === 'FRAME' ? 'type-frame' : 'type-image';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="content-wrapper">
          <div className="header">
            <h1 className="header-title">Shop Items</h1>
            <div className="loading">
              <FaSpinner className="icon-md icon-spin" />
              <span>Đang tải sản phẩm...</span>
            </div>
          </div>
          <div className="grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card card-pulse">
                <div className="card-image-placeholder"></div>
                <div className="card-content">
                  <div className="placeholder-title"></div>
                  <div className="placeholder-button"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="content-wrapper">
          <div className="error">
            <FaExclamationCircle className="icon-lg error-icon" />
            <h2 className="error-title">Lỗi tải dữ liệu</h2>
            <p className="error-message">{error}</p>
            <button onClick={fetchShopItems} className="retry-button">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="content-wrapper">
        <div className="header">
          <h1 className="header-title">Shop Items</h1>
          <p className="header-subtitle">Khám phá các sản phẩm tuyệt vời</p>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaShoppingCart className="icon-lg" />
            </div>
            <p className="empty-message">Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="grid">
            {items.map((item) => {
              const hasDiscount = item.discount && item.discount > 0;
              const isOwned = userItem && userItem.some(owned => owned.itemId === item.id);

              return (
                <div key={item.id} className="card card-hover">
                  <div className="card-image-container">
                    <img
                      src={`http://localhost:3000${item.imageUrl}`}
                      alt={item.name}
                      className="card-image"
                    />
                    <div className={`type-badge ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                      {item.type}
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="card-title-price">
                      <h3 className="card-title">{item.name}</h3>
                      <p className="card-price">
                        {hasDiscount ? discountedPrice : item.price} point
                      </p>
                    </div>

                    {isOwned ? (
                      <button
                        className={`purchase-button ${purchasing[item.id] ? 'purchase-button-disabled' : ''}`}
                        style={{ 
                          backgroundColor: '#4CAF50', 
                          color: 'white',
                          cursor: 'default',
                          opacity: '0.8'
                        }}
                        disabled
                      >
                        <span>Bạn đã sở hữu nó!!!</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={purchasing[item.id]}
                        className={`purchase-button ${purchasing[item.id] ? 'purchase-button-disabled' : ''}`}
                      >
                        {purchasing[item.id] ? (
                          <>
                            <FaSpinner className="icon-md icon-spin" />
                            <span>Đang mua...</span>
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="icon-md" />
                            <span>Mua</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Admin Upload Button */}
        {userRole === 'Admin' && (
          <button 
            className="admin-upload-btn"
            onClick={() => setShowUploadModal(true)}
          >
            <FaPlus className="icon-md" />
          </button>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Upload Item</h2>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowUploadModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleUploadSubmit} className="upload-form">
                <div className="form-group">
                  <label>Tên sản phẩm:</label>
                  <input
                    type="text"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giá (points):</label>
                  <input
                    type="number"
                    value={uploadForm.price}
                    onChange={(e) => setUploadForm({...uploadForm, price: e.target.value})}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Loại:</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="FRAME">Frame</option>
                    <option value="BGR">Background</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Hình ảnh:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadForm({...uploadForm, image: e.target.files[0]})}
                    className="form-file-input"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="cancel-btn"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`submit-btn ${uploading ? 'submit-btn-disabled' : ''}`}
                  >
                    {uploading ? (
                      <>
                        <FaSpinner className="icon-sm icon-spin" />
                        Đang upload...
                      </>
                    ) : (
                      'Upload'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;