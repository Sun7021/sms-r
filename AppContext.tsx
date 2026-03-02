
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, Order, InventoryItem, SalesRecord, Branch, LoyaltyMember, OrderStatus, User, Role, DiscountCode, AppNotification } from './types';
import { INITIAL_MENU, INITIAL_INVENTORY, INITIAL_SALES, INITIAL_BRANCHES, INITIAL_LOYALTY } from './constants';
import { supabase } from './supabaseClient';

interface AppContextType {
  menu: MenuItem[];
  orders: Order[];
  inventory: InventoryItem[];
  salesHistory: SalesRecord[];
  branches: Branch[];
  discountCodes: DiscountCode[];
  loyaltyMembers: LoyaltyMember[];
  notifications: AppNotification[];
  currentBranch: Branch;
  user: User | null;
  staff: (User & { password?: string })[];
  addOrder: (order: Omit<Order, 'branchId'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  setBranch: (branch: Branch) => void;
  addBranch: (branch: Branch) => Promise<void>;
  deductInventory: (orderItems: any[]) => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addStaff: (staffMember: User & { password?: string }) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;
  updateMenu: (newMenu: MenuItem[]) => Promise<void>;
  updateInventory: (newInventory: InventoryItem[]) => Promise<void>;
  addDiscountCode: (code: DiscountCode) => Promise<void>;
  removeDiscountCode: (code: string) => Promise<void>;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationsAsRead: () => void;
  isSyncing: boolean;
  cloudStatus: 'connected' | 'syncing' | 'error' | 'offline';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [salesHistory] = useState<SalesRecord[]>(INITIAL_SALES);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]);
  const [loyaltyMembers] = useState<LoyaltyMember[]>(INITIAL_LOYALTY);
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<(User & { password?: string })[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'syncing' | 'error' | 'offline'>('connected');

  const fetchInitialData = async () => {
    try {
      setCloudStatus('syncing');
      
      const { data: menuData } = await supabase.from('menu').select('*');
      if (menuData && menuData.length > 0) setMenu(menuData);

      const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (orderData) {
        setOrders(orderData.map(o => ({
          ...o,
          branchId: o.branch_id,
          tableNumber: o.table_number,
          appliedPromo: o.applied_promo,
          createdAt: new Date(o.created_at),
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          paymentMethod: o.payment_method
        })));
      }

      const { data: invData } = await supabase.from('inventory').select('*');
      if (invData && invData.length > 0) {
        setInventory(invData.map(i => ({
          id: i.id,
          name: i.name,
          currentStock: i.current_stock,
          minStock: i.min_stock,
          unit: i.unit,
          costPerUnit: i.cost_per_unit
        })));
      }

      const { data: staffData } = await supabase.from('staff').select('*');
      if (staffData) setStaff(staffData);

      const { data: discountData } = await supabase.from('discount_codes').select('*');
      if (discountData) {
        setDiscountCodes(discountData.map(d => ({
          code: d.code,
          type: d.type,
          value: d.value,
          minOrder: d.min_order
        })));
      }

      const { data: branchData } = await supabase.from('branches').select('*');
      if (branchData && branchData.length > 0) setBranches(branchData);

      setCloudStatus('connected');
    } catch (err) {
      console.error('Initial fetch error:', err);
      setCloudStatus('offline');
    }
  };

  useEffect(() => {
    fetchInitialData();

    const orderSubscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', table: 'orders', schema: 'public' }, (payload) => {
        const parseOrder = (o: any): Order => ({
          ...o,
          branchId: o.branch_id,
          tableNumber: o.table_number,
          appliedPromo: o.applied_promo,
          createdAt: new Date(o.created_at),
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          paymentMethod: o.payment_method
        });

        if (payload.eventType === 'INSERT') {
          setOrders(prev => [parseOrder(payload.new), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? parseOrder(payload.new) : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (username === 'suraj' && password === 'Sur@j') {
      setUser({ id: 'admin-0', username: 'suraj', role: 'ADMIN', name: 'Suraj Admin' });
      return true;
    }
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (data && !error) {
      setUser({ id: data.id, username: data.username, role: data.role, name: data.name });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const addStaff = async (staffMember: User & { password?: string }) => {
    setIsSyncing(true);
    await supabase.from('staff').upsert(staffMember);
    setStaff(prev => [...prev, staffMember]);
    setIsSyncing(false);
  };

  const removeStaff = async (id: string) => {
    setIsSyncing(true);
    await supabase.from('staff').delete().eq('id', id);
    setStaff(prev => prev.filter(s => s.id !== id));
    setIsSyncing(false);
  };

  const addDiscountCode = async (code: DiscountCode) => {
    setIsSyncing(true);
    await supabase.from('discount_codes').upsert({
      code: code.code,
      type: code.type,
      value: code.value,
      min_order: code.minOrder
    });
    setDiscountCodes(prev => [...prev, code]);
    setIsSyncing(false);
  };

  const removeDiscountCode = async (code: string) => {
    setIsSyncing(true);
    await supabase.from('discount_codes').delete().eq('code', code);
    setDiscountCodes(prev => prev.filter(c => c.code !== code));
    setIsSyncing(false);
  };

  const addBranch = async (branch: Branch) => {
    setIsSyncing(true);
    await supabase.from('branches').upsert(branch);
    setBranches(prev => [...prev, branch]);
    setIsSyncing(false);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addOrder = async (orderData: Omit<Order, 'branchId'>) => {
    setIsSyncing(true);
    const orderToInsert = {
      id: orderData.id,
      branch_id: currentBranch.id,
      table_number: orderData.tableNumber,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      applied_promo: orderData.appliedPromo,
      cgst: orderData.cgst,
      sgst: orderData.sgst,
      total: orderData.total,
      status: orderData.status,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      notes: orderData.notes,
      payment_method: orderData.paymentMethod
    };
    
    const { error } = await supabase.from('orders').insert(orderToInsert);
    if (!error) {
      await deductInventory(orderData.items);
      addNotification({
        title: 'New Order Received',
        message: `[${currentBranch.name}] Table #${orderData.tableNumber} placed order #${orderData.id} for ₹${orderData.total.toFixed(2)}`,
        type: 'SUCCESS'
      });
    }
    setIsSyncing(false);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setIsSyncing(true);
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        addNotification({
          title: 'Order Updated',
          message: `Order #${order.id} at ${currentBranch.name} is now ${status}`,
          type: 'INFO'
        });
      }
    }
    setIsSyncing(false);
  };

  const updateMenu = async (newMenu: MenuItem[]) => {
    setIsSyncing(true);
    const { error } = await supabase.from('menu').upsert(newMenu);
    if (!error) setMenu(newMenu);
    setIsSyncing(false);
  };
  
  const updateInventory = async (newInventory: InventoryItem[]) => {
    setIsSyncing(true);
    const mapped = newInventory.map(i => ({
      id: i.id,
      name: i.name,
      current_stock: i.currentStock,
      min_stock: i.minStock,
      unit: i.unit,
      cost_per_unit: i.costPerUnit
    }));
    const { error } = await supabase.from('inventory').upsert(mapped);
    if (!error) setInventory(newInventory);
    setIsSyncing(false);
  };

  const deductInventory = async (orderItems: any[]) => {
    const nextInventory = inventory.map(invItem => {
      let updated = { ...invItem };
      orderItems.forEach(item => {
        const menuItem = menu.find(m => m.id === item.menuItemId);
        if (menuItem) {
          menuItem.ingredients.forEach(ing => {
            if (ing.name.toLowerCase() === invItem.name.toLowerCase()) {
              updated.currentStock -= ing.quantity * item.quantity;
            }
          });
        }
      });
      return updated;
    });
    await updateInventory(nextInventory);
  };

  return (
    <AppContext.Provider value={{ 
      menu, orders, inventory, salesHistory, branches, discountCodes, notifications,
      loyaltyMembers, currentBranch, user, staff,
      addOrder, updateOrderStatus, setBranch: setCurrentBranch, addBranch, deductInventory,
      login, logout, addStaff, removeStaff, updateMenu, updateInventory,
      addDiscountCode, removeDiscountCode, addNotification, markNotificationsAsRead,
      isSyncing, cloudStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp error");
  return context;
};
