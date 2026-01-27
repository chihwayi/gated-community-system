import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, DollarSign, Tag, Image as ImageIcon, Edit, Trash, Upload, X } from 'lucide-react';
import { marketplaceService, MarketplaceItem, CreateItemData } from '@/services/marketplaceService';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/lib/api-config';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';

export default function MarketplaceSection() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [myItems, setMyItems] = useState<MarketplaceItem[]>([]);
  const [view, setView] = useState<'browse' | 'selling'>('browse');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateItemData>({
    title: '',
    description: '',
    price: 0,
    category: 'Other',
    condition: 'Used',
    images: []
  });

  useEffect(() => {
    fetchItems();
    if (view === 'selling') {
      fetchMyItems();
    }
  }, [view, categoryFilter]);

  const getImageUrl = (item: MarketplaceItem, index: number = 0) => {
    if (item.image_urls && item.image_urls.length > index) {
      return item.image_urls[index];
    }
    // Fallback if no presigned URL (should not happen for new items)
    const path = item.images?.[index];
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // If it's an object key without presigned url (legacy or sync issue), we can't easily display it 
    // without fetching it, but let's try assuming it might be a static path if it starts with /static
    if (path.startsWith('/static')) {
        const baseUrl = API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, '');
        return `${baseUrl}${path}`;
    }
    return ''; // Can't display raw object key
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const file = e.target.files[0];
        const response = await marketplaceService.uploadImage(file);
        // We store the object_key in the form data for submission
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, response.data.object_key]
        }));
        // Store URL for preview
        setPreviewImages(prev => [...prev, response.data.url]);
      } catch (error) {
        console.error('Failed to upload image', error);
        showToast('Failed to upload image', 'error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };


  const fetchItems = async () => {
    try {
      const response = await marketplaceService.getItems(categoryFilter || undefined);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch marketplace items', error);
    }
  };

  const fetchMyItems = async () => {
    try {
      const response = await marketplaceService.getMyItems();
      setMyItems(response.data);
    } catch (error) {
      console.error('Failed to fetch my items', error);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await marketplaceService.createItem(formData);
      setShowCreateModal(false);
      fetchItems();
      if (view === 'selling') fetchMyItems();
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: 'Other',
        condition: 'Used',
        images: []
      });
      setPreviewImages([]);
      showToast('Item listed successfully!', 'success');
    } catch (error) {
      console.error('Failed to create item', error);
      showToast('Failed to create item', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100">Community Marketplace</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('browse')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'browse' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setView('selling')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'selling' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={20} />
            <span>Sell Item</span>
          </button>
        </div>
      </div>

      {view === 'browse' && (
        <div className="flex space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Clothing">Clothing</option>
            <option value="Services">Services</option>
            <option value="Food">Food</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(view === 'browse' ? items : myItems).map((item) => (
          <div key={item.id} className="bg-slate-900/50 rounded-xl shadow-sm border border-white/5 overflow-hidden hover:border-white/10 transition-all">
            <div className="h-48 bg-slate-800 flex items-center justify-center relative group">
              {item.images && item.images.length > 0 ? (
                <img src={getImageUrl(item, 0)} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={48} className="text-slate-600 group-hover:text-slate-500 transition-colors" />
              )}
              <div className="absolute top-2 right-2">
                <span className="bg-slate-900/80 backdrop-blur-sm text-slate-200 text-xs px-2 py-1 rounded-full border border-white/10">
                  {item.condition}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
                <span className="text-emerald-400 font-bold">
                  ${item.price}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-3 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Tag size={14} />
                  {item.category}
                </span>
                <span className="text-xs text-slate-600">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              {view === 'selling' && (
                 <div className="mt-4 flex justify-end space-x-2 pt-4 border-t border-white/5">
                    <button className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors">
                        <Edit size={16} />
                    </button>
                    <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash size={16} />
                    </button>
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-100">List an Item</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="What are you selling?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Services">Services</option>
                    <option value="Food">Food</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="New">New</option>
                  <option value="Used - Like New">Used - Like New</option>
                  <option value="Used - Good">Used - Good</option>
                  <option value="Used - Fair">Used - Fair</option>
                  <option value="N/A">N/A (Services/Food)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Images</label>
                <div className="grid grid-cols-4 gap-4 mb-2">
                  {previewImages.map((imgUrl, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 border border-white/10 group">
                      <img src={imgUrl} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-slate-700 hover:border-cyan-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                    <div className="p-2 bg-slate-800 rounded-full mb-2 group-hover:bg-slate-700 transition-colors">
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload size={20} className="text-slate-400 group-hover:text-cyan-400" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500 group-hover:text-slate-400">Add Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUploading} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Describe your item..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98]"
              >
                {editingItem ? 'Update Listing' : 'Post Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
