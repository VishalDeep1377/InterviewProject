"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
        ...(token && { "Authorization": `Bearer ${token}` }),
    };
};

export const api = {
    login: async (email, password) => {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error('Invalid credentials');
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    register: async (name, email, password) => {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        if (!res.ok) throw new Error('Registration failed');
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    upload: async (files) => {
        const formData = new FormData();
        files.forEach(f => formData.append("files", f));
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: getHeaders(),
            body: formData
        });
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
    },

    getOrders: async () => {
        const res = await fetch(`${API_BASE}/orders`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
    },

    getSummary: async () => {
        const res = await fetch(`${API_BASE}/analytics/summary`, { headers: getHeaders() });
        if (!res.ok) return null;
        return res.json();
    },

    getSupplierData: async () => {
        const res = await fetch(`${API_BASE}/analytics/supplier`, { headers: getHeaders() });
        if (!res.ok) return [];
        return res.json();
    },

    getBrandData: async () => {
        const res = await fetch(`${API_BASE}/analytics/brand`, { headers: getHeaders() });
        if (!res.ok) return [];
        return res.json();
    },

    getCategories: async () => {
        const res = await fetch(`${API_BASE}/analytics/categories`, { headers: getHeaders() });
        if (!res.ok) return [];
        return res.json();
    },

    getTimelineData: async () => {
        const res = await fetch(`${API_BASE}/analytics/timeline`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Timeline fetch failed");
        return res.json();
    },

    getAIInsights: async () => {
        const res = await fetch(`${API_BASE}/analytics/insights`, { headers: getHeaders() });
        if (!res.ok) throw new Error("AI Insights fetch failed");
        return res.json();
    },

    getLiveCurrencyRate: async () => {
        const res = await fetch(`${API_BASE}/analytics/currency`, { headers: getHeaders() });
        if (!res.ok) return 0.79;
        const data = await res.json();
        return data.rate;
    },

    syncOrder: async (orderId) => {
        const res = await fetch(`${API_BASE}/orders/sync`, {
            method: 'POST',
            headers: { ...getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
        });
        if (!res.ok) throw new Error("Sync failed");
        return res.json();
    },

    deleteOrder: async (id) => {
        const res = await fetch(`${API_BASE}/orders/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Delete failed");
        return res.json();
    },

    clearAll: async () => {
        const res = await fetch(`${API_BASE}/orders/all`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Clear All failed");
        return res.json();
    },

    exportCSV: async () => {
        const res = await fetch(`${API_BASE}/export/csv`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Export failed");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "purchase_orders.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }
};
