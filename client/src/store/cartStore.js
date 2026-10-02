import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  items: [], // { productId, name, price, costPrice, stock, qty }

  addItem: (product) => {
    const existing = get().items.find((i) => i.productId === product._id);
    if (existing) {
      if (existing.qty >= product.currentStock) return; // don't exceed stock
      set({
        items: get().items.map((i) =>
          i.productId === product._id ? { ...i, qty: i.qty + 1 } : i,
        ),
      });
    } else {
      set({
        items: [
          ...get().items,
          {
            productId: product._id,
            name: product.name,
            price: product.sellingPrice,
            stock: product.currentStock,
            qty: 1,
          },
        ],
      });
    }
  },

  incrementQty: (productId) => {
    set({
      items: get().items.map((i) =>
        i.productId === productId && i.qty < i.stock
          ? { ...i, qty: i.qty + 1 }
          : i,
      ),
    });
  },

  decrementQty: (productId) => {
    set({
      items: get()
        .items.map((i) =>
          i.productId === productId ? { ...i, qty: i.qty - 1 } : i,
        )
        .filter((i) => i.qty > 0),
    });
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) });
  },

  clear: () => set({ items: [] }),

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
}));
