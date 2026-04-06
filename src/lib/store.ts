import { create } from 'zustand';

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
};

export type CartItem = Product & {
  quantity: number;
};

interface CartState {
  items: CartItem[];
  deliveryMethod: 'delivery' | 'pickup';
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDeliveryMethod: (method: 'delivery' | 'pickup') => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  deliveryMethod: 'delivery',
  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
      ),
    })),
  setDeliveryMethod: (method) => set({ deliveryMethod: method }),
  clearCart: () => set({ items: [] }),
}));
