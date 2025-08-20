import React, { useState, useEffect } from 'react'
import './Marketing.css'
import { toast } from "react-toastify"
import axios from "axios"

const Marketing = ({ url }) => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeTab, setActiveTab] = useState('promo');
  
  // Promo Code Form State
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountPercentage: '',
    maxUses: '',
    validUntil: '',
    description: ''
  });
  
  // Banner Form State
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image: null,
    link: '',
    isActive: true
  });

  // Banner Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const fetchPromoCodes = async () => {
    try {
      const response = await axios.get(`${url}/api/promo/list`);
      if (response.data.success) {
        setPromoCodes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${url}/api/banner/list`);
      if (response.data.success) {
        setBanners(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
    fetchBanners();
  }, []);

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url}/api/promo/create`, promoForm);
      if (response.data.success) {
        toast.success('Promo code created successfully!');
        setPromoForm({
          code: '',
          discountPercentage: '',
          maxUses: '',
          validUntil: '',
          description: ''
        });
        fetchPromoCodes();
      } else {
        toast.error(response.data.message || 'Error creating promo code');
      }
    } catch (error) {
      toast.error('Error creating promo code');
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', bannerForm.title);
      formData.append('subtitle', bannerForm.subtitle);
      formData.append('link', bannerForm.link);
      formData.append('isActive', bannerForm.isActive);
      if (bannerForm.image) {
        formData.append('image', bannerForm.image);
      }

      const endpoint = editingBanner 
        ? `${url}/api/banner/update/${editingBanner._id}`
        : `${url}/api/banner/create`;

      const response = await axios[editingBanner ? 'put' : 'post'](endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
        setBannerForm({
          title: '',
          subtitle: '',
          image: null,
          link: '',
          isActive: true
        });
        setEditingBanner(null);
        fetchBanners();
      } else {
        toast.error(response.data.message || 'Error creating banner');
      }
    } catch (error) {
      toast.error('Error creating banner');
    }
  };

  const deletePromoCode = async (id) => {
    try {
      const response = await axios.delete(`${url}/api/promo/delete/${id}`);
      if (response.data.success) {
        toast.success('Promo code deleted successfully!');
        fetchPromoCodes();
      }
    } catch (error) {
      toast.error('Error deleting promo code');
    }
  };

  const deleteBanner = async (id) => {
    try {
      const response = await axios.delete(`${url}/api/banner/delete/${id}`);
      if (response.data.success) {
        toast.success('Banner deleted successfully!');
        fetchBanners();
      }
    } catch (error) {
      toast.error('Error deleting banner');
    }
  };

  const toggleBannerStatus = async (id, currentStatus) => {
    try {
      const response = await axios.patch(`${url}/api/banner/toggle/${id}`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        toast.success('Banner status updated!');
        fetchBanners();
      }
    } catch (error) {
      toast.error('Error updating banner status');
    }
  };

  const handlePreviewBanner = () => {
    if (!bannerForm.title || !bannerForm.image) {
      toast.error('Please fill in title and upload an image to preview');
      return;
    }
    setShowPreview(true);
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle,
      image: null, // Don't pre-fill image for edit
      link: banner.link,
      isActive: banner.isActive
    });
  };

  const handleCancelEdit = () => {
    setEditingBanner(null);
    setBannerForm({
      title: '',
      subtitle: '',
      image: null,
      link: '',
      isActive: true
    });
  };

  return (
    <div className="marketing-container">
      <div className="marketing-header">
        <h2>Marketing & Promotions</h2>
        <p>Manage promo codes and promotional banners</p>
      </div>

      <div className="marketing-tabs">
        <button 
          className={`tab-button ${activeTab === 'promo' ? 'active' : ''}`}
          onClick={() => setActiveTab('promo')}
        >
          Promo Codes
        </button>
        <button 
          className={`tab-button ${activeTab === 'banner' ? 'active' : ''}`}
          onClick={() => setActiveTab('banner')}
        >
          Banners
        </button>
      </div>

      {activeTab === 'promo' && (
        <div className="promo-section">
          <div className="section-header">
            <h3>Create Promo Code</h3>
            <p>Create discount codes for customers</p>
          </div>

          <form onSubmit={handlePromoSubmit} className="promo-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Promo Code</label>
                <input
                  type="text"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., BLACKFRIDAY20"
                  required
                />
              </div>

              <div className="form-group">
                <label>Discount Percentage</label>
                <input
                  type="number"
                  value={promoForm.discountPercentage}
                  onChange={(e) => setPromoForm({...promoForm, discountPercentage: e.target.value})}
                  placeholder="e.g., 20"
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label>Maximum Uses</label>
                <input
                  type="number"
                  value={promoForm.maxUses}
                  onChange={(e) => setPromoForm({...promoForm, maxUses: e.target.value})}
                  placeholder="e.g., 100"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Valid Until</label>
                <input
                  type="datetime-local"
                  value={promoForm.validUntil}
                  onChange={(e) => setPromoForm({...promoForm, validUntil: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={promoForm.description}
                onChange={(e) => setPromoForm({...promoForm, description: e.target.value})}
                placeholder="Describe the promo code..."
                rows="3"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Create Promo Code
            </button>
          </form>

          <div className="promo-codes-list">
            <h3>Active Promo Codes</h3>
            <div className="codes-grid">
              {promoCodes.map((promo) => (
                <div key={promo._id} className="promo-card">
                  <div className="promo-header">
                    <h4>{promo.code}</h4>
                    <span className="discount-badge">{promo.discountPercentage}% OFF</span>
                  </div>
                  <p className="promo-description">{promo.description}</p>
                  <div className="promo-details">
                    <span>Uses: {promo.usedCount}/{promo.maxUses}</span>
                    <span>Valid until: {new Date(promo.validUntil).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => deletePromoCode(promo._id)}
                    className="btn btn-secondary delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'banner' && (
        <div className="banner-section">
          <div className="section-header">
            <h3>Create Banner</h3>
            <p>Create promotional banners for the homepage</p>
          </div>

          <form onSubmit={handleBannerSubmit} className="banner-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Banner Title</label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                  placeholder="e.g., Black Friday Sale"
                  required
                />
              </div>

              <div className="form-group">
                <label>Subtitle</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                  placeholder="e.g., Up to 50% off on all items"
                />
              </div>

              <div className="form-group">
                <label>Link (Optional)</label>
                <input
                  type="url"
                  value={bannerForm.link}
                  onChange={(e) => setBannerForm({...bannerForm, link: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label>Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerForm({...bannerForm, image: e.target.files[0]})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={bannerForm.isActive}
                  onChange={(e) => setBannerForm({...bannerForm, isActive: e.target.checked})}
                />
                Active Banner
              </label>
            </div>

            <div className="banner-form-actions">
              <button type="button" onClick={handlePreviewBanner} className="btn btn-secondary">
                Preview Banner
              </button>
              <button type="submit" className="btn btn-primary">
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </button>
              {editingBanner && (
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="banners-list">
            <h3>Active Banners</h3>
            <div className="banners-grid">
              {banners.map((banner) => (
                <div key={banner._id} className="banner-card">
                  <div className="banner-image">
                    <img src={`${url}/uploads/${banner.image}`} alt={banner.title} />
                    <div className="banner-overlay">
                      <h4>{banner.title}</h4>
                      <p>{banner.subtitle}</p>
                    </div>
                  </div>
                  <div className="banner-actions">
                    <button 
                      onClick={() => handleEditBanner(banner)}
                      className="btn btn-secondary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => toggleBannerStatus(banner._id, banner.isActive)}
                      className={`btn ${banner.isActive ? 'btn-secondary' : 'btn-primary'}`}
                    >
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => deleteBanner(banner._id)}
                      className="btn btn-secondary delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Banner Preview Modal */}
      {showPreview && (
        <div className="banner-preview-modal">
          <div className="banner-preview-overlay" onClick={() => setShowPreview(false)}>
            <div className="banner-preview-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="banner-preview-close"
                onClick={() => setShowPreview(false)}
              >
                ×
              </button>
              <div className="banner-preview-image">
                <img 
                  src={URL.createObjectURL(bannerForm.image)} 
                  alt={bannerForm.title}
                />
                <div className="banner-preview-overlay-text">
                  <h2>{bannerForm.title}</h2>
                  {bannerForm.subtitle && <p>{bannerForm.subtitle}</p>}
                </div>
              </div>
              <div className="banner-preview-info">
                <h3>Banner Preview</h3>
                <p><strong>Title:</strong> {bannerForm.title}</p>
                <p><strong>Subtitle:</strong> {bannerForm.subtitle || 'None'}</p>
                <p><strong>Link:</strong> {bannerForm.link || 'None'}</p>
                <p><strong>Status:</strong> {bannerForm.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Marketing
