import React, { useState, useEffect } from 'react';
import {
  IoPersonAdd,
  IoEye,
  IoCreate,
  IoBan,
  IoClose,
  IoSave,
  IoTrash,
  IoPeople,
  IoCheckmark,
  IoWarning,
  IoSearch,
  IoRefresh
} from 'react-icons/io5';
import axiosInstance from '../utils/api';
import '../styles/adminUser.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Form states
  const [createForm, setCreateForm] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'User',
    bio: '',
    avatar: "/uploads/user-images/default.png"
  });

  const [editForm, setEditForm] = useState({
    displayName: '',
    email: '',
    role: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/user', {
        withCredentials: true
      });
      if (response.data?.data) {
        setUsers(response.data.data);
        setTotalUsers(response.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/user/create', createForm, {
        withCredentials: true
      });
      if (response.data?.success) {
        alert('Tạo người dùng thành công!');
        setShowCreateModal(false);
        setCreateForm({
          username: '',
          status:'Active',
          displayName: '',
          email: '',
          password: '',
          role: 'User',
          avatar: "/uploads/user-images/default.png",
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Không thể tạo người dùng: ' + (error.response?.data?.message || 'Lỗi không xác định'));
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`/admin/users/${selectedUser.id}`, editForm, {
        withCredentials: true
      });
      if (response.data?.success) {
        alert('Cập nhật người dùng thành công!');
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Không thể cập nhật người dùng: ' + (error.response?.data?.message || 'Lỗi không xác định'));
    }
  };

  const handleBanUser = async (userId, currentStatus) => {
    const action = currentStatus ? 'cấm' : 'kích hoạt';
    if (window.confirm(`Bạn có chắc chắn muốn ${action} người dùng này?`)) {
      try {
        const response = await axiosInstance.patch(`/user/${userId}/ban`, {
          isActive: !currentStatus
        }, {
          withCredentials: true
        });
        fetchUsers();
      } catch (error) {
        console.error('Error banning/unbanning user:', error);
        alert(`Không thể ${action} người dùng: ` + (error.response?.data?.message || 'Lỗi không xác định'));
      }
    }
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      displayName: user.displayName || '',
      email: user.email || '',
      role: user.role || 'USER',
      bio: user.bio || '',
      avatar: user.avatar || '',
      isActive: user.isActive !== false
    });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="admin-users-container">
      <div className="admin-header">
        <h1 className="admin-title">
          <IoPeople className="title-icon" />
          Quản lý người dùng
        </h1>
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{totalUsers}</div>
            <div className="stat-label">Tổng số người dùng</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{users.filter(u => u.status === "Active").length}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{users.filter(u => u.role === 'Admin').length}</div>
            <div className="stat-label">Quản trị viên</div>
          </div>
        </div>
      </div>

      <div className="admin-controls">
        <div className="search-filter-section">
          <div className="search-box">
            <IoSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          {/* <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="USER">Người dùng</option>
            <option value="ADMIN">Quản trị viên</option>
          </select> */}
        </div>
        <div className="action-buttons">
          <button onClick={fetchUsers} className="refresh-btn">
            <IoRefresh />
            Làm mới
          </button>
          <button onClick={() => setShowCreateModal(true)} className="create-user-btn">
            <IoPersonAdd />
            Tạo người dùng mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Tên hiển thị</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.status === "Banned" ? 'banned-user' : ''}>
                  <td>
                    <img 
                      src={user.avatar ? `http://localhost:3000${user.avatar}` : 'https://via.placeholder.com/40'} 
                      alt="Avatar" 
                      className="user-avatar"
                    />
                  </td>
                  <td className="user-name">{user.displayName || 'Chưa có tên'}</td>
                  <td className="user-email">{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role?.toLowerCase()}`}>
                      {user.role === 'Admin' ? 'Quản trị' : 'Người dùng'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive !== false ? 'active' : 'banned'}`}>
                      {user.status !== "Banned" ? 'Hoạt động' : 'Bị cấm'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-group">
                      <button 
                        onClick={() => openViewModal(user)}
                        className="action-btn view-btn"
                        title="Xem chi tiết"
                      >
                        <IoEye />
                      </button>
                      <button 
                        onClick={() => openEditModal(user)}
                        className="action-btn edit-btn"
                        title="Chỉnh sửa"
                      >
                        <IoCreate />
                      </button>
                      <button 
                        onClick={() => handleBanUser(user.id, user.status === "Active")}
                        className={`action-btn ${user.status === "Active" ? 'ban-btn' : 'unban-btn'}`}
                        title={user.status === "Active" ? 'Cấm người dùng' : 'Kích hoạt người dùng'}
                      >
                        {user.status === "Active" ? <IoBan /> : <IoCheckmark />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="no-users">
              <p>Không tìm thấy người dùng nào</p>
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Tạo người dùng mới</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">
                <IoClose />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-group">
                <label>Tên người dùng</label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tên hiển thị</label>
                <input
                  type="text"
                  value={createForm.displayName}
                  onChange={(e) => setCreateForm({...createForm, displayName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                >
                  <option value="User">Người dùng</option>
                  <option value="Admin">Quản trị viên</option>
                </select>
              </div>
              {/* <div className="form-group">
                <label>Tiểu sử</label>
                <textarea
                  value={createForm.bio}
                  onChange={(e) => setCreateForm({...createForm, bio: e.target.value})}
                  rows="3"
                />
              </div> */}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-btn">
                  Hủy
                </button>
                <button type="submit" className="save-btn">
                  <IoSave />
                  Tạo người dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal view-modal">
            <div className="modal-header">
              <h2>Thông tin chi tiết người dùng</h2>
              <button onClick={() => setShowViewModal(false)} className="close-btn">
                <IoClose />
              </button>
            </div>
            <div className="user-details">
              <div className="user-avatar-section">
                <img 
                  src={selectedUser.avatar ? `http://localhost:3000${selectedUser.avatar}` : 'https://via.placeholder.com/100'} 
                  alt="Avatar" 
                  className="large-avatar"
                />
              </div>
              <div className="user-info-grid">
                <div className="info-item">
                  <label>ID:</label>
                  <span>{selectedUser.id}</span>
                </div>
                <div className="info-item">
                  <label>Tên:</label>
                  <span>{selectedUser.username}</span>
                </div>
                <div className="info-item">
                  <label>Tên hiển thị:</label>
                  <span>{selectedUser.displayName || 'Chưa có'}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="info-item">
                  <label>Vai trò:</label>
                  <span className={`role-badge ${selectedUser.role?.toLowerCase()}`}>
                    {selectedUser.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Trạng thái:</label>
                  <span className={`status-badge ${selectedUser.status === "Active" ? 'active' : 'banned'}`}>
                    {selectedUser.status === "Active" ? 'Hoạt động' : 'Bị cấm'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Ngày tạo:</label>
                  <span>{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                {/* <div className="info-item full-width">
                  <label>Tiểu sử:</label>
                  <span>{selectedUser.bio || 'Chưa có tiểu sử'}</span>
                </div> */}
                <div className="info-item">
                  <label>Points:</label>
                  <span>{selectedUser.point}</span>
                </div>
                <div className="info-item">
                  <label>Giới tính:</label>
                  <span>{selectedUser.gender}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Chỉnh sửa thông tin người dùng</h2>
              <button onClick={() => setShowEditModal(false)} className="close-btn">
                <IoClose />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="modal-form">
              <div className="form-group">
                <label>Tên hiển thị</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                >
                  <option value="USER">Người dùng</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tiểu sử</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                  />
                  Tài khoản hoạt động
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  Hủy
                </button>
                <button type="submit" className="save-btn">
                  <IoSave />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}