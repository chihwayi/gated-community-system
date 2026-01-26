import api from './api';

export interface MarketplaceItem {
  id: number;
  seller_id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  status: 'available' | 'pending' | 'sold';
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateItemData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
}

export interface UpdateItemData {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  condition?: string;
  status?: 'available' | 'pending' | 'sold';
  images?: string[];
}

export const marketplaceService = {
  getItems: async (category?: string, skip: number = 0, limit: number = 100) => {
    let url = `/marketplace/?skip=${skip}&limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    return api.get<MarketplaceItem[]>(url);
  },

  getMyItems: async () => {
    return api.get<MarketplaceItem[]>('/marketplace/me');
  },

  getItem: async (id: number) => {
    return api.get<MarketplaceItem>(`/marketplace/${id}`);
  },

  createItem: async (data: CreateItemData) => {
    return api.post<MarketplaceItem>('/marketplace/', data);
  },

  updateItem: async (id: number, data: UpdateItemData) => {
    return api.patch<MarketplaceItem>(`/marketplace/${id}`, data);
  },

  deleteItem: async (id: number) => {
    return api.delete<MarketplaceItem>(`/marketplace/${id}`);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{url: string}>('/utils/upload', formData);
  }
};
