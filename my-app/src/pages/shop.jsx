import React, { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaTag,
  FaImage,
  FaRegSquare,
  FaSpinner,
  FaExclamationCircle,
  FaPlus,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import "../styles/shop.css";
import axiosInstance from "../utils/api";
import { IoColorFill } from "react-icons/io5";
import { useUser } from "../context/UserContext";

const Shop = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState({});
  const [userItem, setUserItem] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    price: "",
    type: "FRAME",
    image: null,
  });
  const [uploading, setUploading] = useState(false);
  const { user, setUser } = useUser();
  const [frameUrlUsed, setFrameUrlUsed] = useState("");
  const [bgrUrlUsed, setBgrUrlUsed] = useState("");
  const [userRole, setUserRole] = useState("User");

  // Popup states
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Error popup state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/shop");
      const userItemData = await getUserItem();
      setUserItem(userItemData.data);
      setFrameUrlUsed(user.frameUrlUsed);
      setBgrUrlUsed(user.bgrUrlUsed);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        setItems(data.data);
      } else if (Array.isArray(data)) {
        setItems(data);
      } else {
        throw new Error("Invalid response format");
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching shop items:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const firstFetch = async () => {
      console.log(user);
      if (user) {
        await fetchShopItems();
        setFrameUrlUsed(user.frameUrl);
        setBgrUrlUsed(user.bgrUrl);
        setUserRole(user.role);
      }
    };
    firstFetch();
  }, [user]);

  const getUserItem = async () => {
    try {
      const response = await axiosInstance.get(
        `http://localhost:3000/shop/user-items`
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching user item:", err);
      return null;
    }
  };

  const handlePurchaseClick = (item) => {
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItem) return;
    
    setPurchasing((prev) => ({ ...prev, [selectedItem.id]: true }));
    try {
      await axiosInstance.post(
        `http://localhost:3000/shop/buy-item/${selectedItem.id}`
      );
      // alert("Mua sản phẩm thành công!");

      setUserItem((prevUserItems) => {
        if (prevUserItems) {
          return [...prevUserItems, { itemId: selectedItem.id }];
        } else {
          return [{ itemId: selectedItem.id }];
        }
      });
      
      setShowPurchaseModal(false);
      setSelectedItem(null);
      window.location.reload();
    } catch (err) {
      console.error("Purchase error:", err);
      
      // Check if error is related to insufficient points
      if (err.response && err.response.status === 400) {
        const errorData = err.response.data;
        if (errorData.message && errorData.message.includes("điểm") || 
            errorData.message && errorData.message.includes("point")) {
          setErrorMessage("Bạn không đủ điểm để mua sản phẩm này!");
        } else {
          setErrorMessage(errorData.message || "Có lỗi xảy ra khi mua sản phẩm");
        }
      } else {
        setErrorMessage("Có lỗi xảy ra khi mua sản phẩm");
      }
      
      setShowErrorModal(true);
      setShowPurchaseModal(false);
      setSelectedItem(null);
    } finally {
      setPurchasing((prev) => ({ ...prev, [selectedItem.id]: false }));
    }
  };

  const handleUseClick = async (item) => {
    setSelectedItem(item);
    setShowUseModal(true);
  };

  const handleConfirmUse = async () => {
    if (!selectedItem) return;

    const formData = new FormData();
    if (selectedItem.type === "FRAME") {
      formData.append("frameUrl", selectedItem.imageUrl);
    } else {
      formData.append("bgrUrl", selectedItem.imageUrl);
    }

    await axiosInstance.patch(`http://localhost:3000/user/update`, formData);
    if (selectedItem.type === "FRAME") {
      setFrameUrlUsed(selectedItem.imageUrl);
      user.frameUrl = selectedItem.imageUrl;
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      setBgrUrlUsed(selectedItem.imageUrl);
      user.bgrUrl = selectedItem.imageUrl;
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    setShowUseModal(false);
    setSelectedItem(null);
    window.location.reload();
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.name || !uploadForm.price || !uploadForm.image) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", uploadForm.name);
      formData.append("price", uploadForm.price);
      formData.append("type", uploadForm.type);
      formData.append("imageUrl", `/uploads/items/${uploadForm.image.name}`);
      formData.append("description", "");
      formData.append("image", uploadForm.image);

      await axiosInstance.post("http://localhost:3000/shop", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Upload thành công!");
      setShowUploadModal(false);
      setUploadForm({ name: "", price: "", type: "FRAME", image: null });
      fetchShopItems(); 
    } catch (err) {
      console.error("Upload error:", err);
      alert("Lỗi khi upload item");
    } finally {
      setUploading(false);
    }
  };

  const getTypeIcon = (type) => {
    return type === "FRAME" ? (
      <FaRegSquare className="icon-sm" />
    ) : (
      <FaImage className="icon-sm" />
    );
  };

  const getTypeColor = (type) => {
    return type === "FRAME" ? "type-frame" : "type-image";
  };

  if (loading) {
    return (
      <div className="container">
        <div className="content-wrapper">
          <div className="header">
            <h1 className="header-title">Cửa hàng trang trí</h1>
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
          <h1 className="header-title">Cửa hàng trang trí</h1>
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
              const isOwned =
                userItem && userItem.some((owned) => owned.itemId === item.id);
              const isFrameUsed =
                frameUrlUsed === item.imageUrl && item.type === "FRAME";
              const isBgrUsed =
                bgrUrlUsed === item.imageUrl && item.type === "BGR";

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
                        className={`use-button ${
                          (isFrameUsed || isBgrUsed) ? "used" : "not-used"
                        }`}
                        onClick={() => handleUseClick(item)}
                      >
                        <span>{(isFrameUsed || isBgrUsed) ? "Đang dùng" : "Sử dụng"}</span>
                        <span></span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchaseClick(item)}
                        disabled={purchasing[item.id]}
                        className={`purchase-button ${
                          purchasing[item.id] ? "purchase-button-disabled" : ""
                        }`}
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
        {userRole === "Admin" && (
          <button
            className="admin-upload-btn"
            onClick={() => setShowUploadModal(true)}
          >
            <FaPlus className="icon-md" />
          </button>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="modal-overlay">
            <div className="modal-content confirmation-modal">
              <div className="modal-header">
                <h2>Thông báo</h2>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowErrorModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="confirmation-content">
                <div className="error-icon-container">
                  <FaExclamationCircle className="icon-lg error-icon" />
                </div>
                <p className="error-message-text">{errorMessage}</p>
              </div>

              <div className="modal-actions">
                <button
                  className="confirm-btn"
                  onClick={() => setShowErrorModal(false)}
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Confirmation Modal */}
        {showPurchaseModal && selectedItem && (
          <div className="modal-overlay">
            <div className="modal-content confirmation-modal">
              <div className="modal-header">
                <h2>Xác nhận mua sản phẩm</h2>
                <button
                  className="modal-close-btn"
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSelectedItem(null);
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="confirmation-content">
                <div className="product-preview">
                  <img
                    src={`http://localhost:3000${selectedItem.imageUrl}`}
                    alt={selectedItem.name}
                    className="preview-image"
                  />
                  <div className="product-info">
                    <h3>{selectedItem.name}</h3>
                    <p className="product-type">
                      {getTypeIcon(selectedItem.type)}
                      {selectedItem.type}
                    </p>
                    <p className="product-price">{selectedItem.price} points</p>
                  </div>
                </div>
                
                <p className="confirmation-text">
                  Bạn có chắc chắn muốn mua sản phẩm này không?
                </p>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSelectedItem(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  className="confirm-btn purchase-confirm"
                  onClick={handleConfirmPurchase}
                  disabled={purchasing[selectedItem.id]}
                >
                  {purchasing[selectedItem.id] ? (
                    <>
                      <FaSpinner className="icon-sm icon-spin" />
                      Đang mua...
                    </>
                  ) : (
                    <>
                      <FaShoppingCart className="icon-sm" />
                      Xác nhận mua
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Use Confirmation Modal */}
        {showUseModal && selectedItem && (
          <div className="modal-overlay">
            <div className="modal-content confirmation-modal">
              <div className="modal-header">
                <h2>Xác nhận sử dụng</h2>
                <button
                  className="modal-close-btn"
                  onClick={() => {
                    setShowUseModal(false);
                    setSelectedItem(null);
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="confirmation-content">
                <div className="product-preview">
                  <div className="demo-container">
                    <div className="demo-preview">
                      {selectedItem.type === "FRAME" ? (
                        <div className="frame-demo">
                          <div className="demo-avatar">
                            <img 
                              src={`http://localhost:3000${user.avatar}` || "/default-avatar.png"} 
                              alt="Avatar" 
                              className="avatar-image"
                            />
                            <img
                              src={`http://localhost:3000${selectedItem.imageUrl}`}
                              alt="Frame"
                              className="frame-overlay"
                            />
                          </div>
                          <p className="demo-label">Preview với khung mới</p>
                        </div>
                      ) : (
                        <div className="background-demo">
                          <img
                            src={`http://localhost:3000${selectedItem.imageUrl}`}
                            alt="Background"
                            className="background-preview"
                          />
                          <p className="demo-label">Preview background mới</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="product-info">
                    <h3>{selectedItem.name}</h3>
                    <p className="product-type">
                      {getTypeIcon(selectedItem.type)}
                      {selectedItem.type}
                    </p>
                  </div>
                </div>
                
                <p className="confirmation-text">
                  Bạn có muốn sử dụng sản phẩm này không?
                </p>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowUseModal(false);
                    setSelectedItem(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  className="confirm-btn use-confirm"
                  onClick={handleConfirmUse}
                >
                  <FaCheck className="icon-sm" />
                  Sử dụng ngay
                </button>
              </div>
            </div>
          </div>
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
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, name: e.target.value })
                    }
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giá (points):</label>
                  <input
                    type="number"
                    value={uploadForm.price}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, price: e.target.value })
                    }
                    className="form-input"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Loại:</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, type: e.target.value })
                    }
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
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, image: e.target.files[0] })
                    }
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
                    className={`submit-btn ${
                      uploading ? "submit-btn-disabled" : ""
                    }`}
                  >
                    {uploading ? (
                      <>
                        <FaSpinner className="icon-sm icon-spin" />
                        Đang upload...
                      </>
                    ) : (
                      "Upload"
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