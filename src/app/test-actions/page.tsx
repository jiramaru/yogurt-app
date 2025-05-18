'use client';

import { useState } from 'react';
import { 
  getUsers, createUser, updateUser, deleteUser,
  getYogurts, createYogurt, updateYogurt, deleteYogurt,
  getOrders, createOrder, updateOrderStatus, deleteOrder,
  getOrderItems, addOrderItem, updateOrderItem, removeOrderItem,
  getDashboardStats, getTopSellingYogurts, getRecentOrders, getLowStockYogurts
} from '@/actions';

export default function TestActionsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Test user actions
  const testGetUsers = async () => {
    setLoading(true);
    const response = await getUsers();
    setResult(response);
    setLoading(false);
  };

  const testCreateUser = async () => {
    setLoading(true);
    const response = await createUser({
      email: `test-${Date.now()}@example.com`,
      phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      role: 'admin'
    });
    setResult(response);
    setLoading(false);
  };

  const testUpdateUser = async () => {
    setLoading(true);
    // First get users to find one to update
    const users = await getUsers();
    if (users.success && users.data && users.data.length > 0) {
      const userToUpdate = users.data[0];
      const response = await updateUser(userToUpdate.id, {
        ...userToUpdate,
        email: `updated-${Date.now()}@example.com`
      });
      setResult(response);
    } else {
      setResult({ success: false, error: 'No users found to update' });
    }
    setLoading(false);
  };

  const testDeleteUser = async () => {
    setLoading(true);
    // First get users to find one to delete
    const users = await getUsers();
    if (users.success && users.data && users.data.length > 0) {
      const userToDelete = users.data[0];
      const response = await deleteUser(userToDelete.id);
      setResult(response);
    } else {
      setResult({ success: false, error: 'No users found to delete' });
    }
    setLoading(false);
  };

  // Test yogurt actions
  const testGetYogurts = async () => {
    setLoading(true);
    const response = await getYogurts();
    setResult(response);
    setLoading(false);
  };

  const testCreateYogurt = async () => {
    setLoading(true);
    const response = await createYogurt({
      name: `Test Yogurt ${Date.now()}`,
      price: 2000,
      description: 'Un délicieux yogurt de test',
      imageUrl: 'https://example.com/yogurt.jpg',
      stock: 100
    });
    setResult(response);
    setLoading(false);
  };

  const testUpdateYogurt = async () => {
    setLoading(true);
    // First get yogurts to find one to update
    const yogurts = await getYogurts();
    if (yogurts.success && yogurts.data && yogurts.data.length > 0) {
      const yogurtToUpdate = yogurts.data[0];
      const response = await updateYogurt(yogurtToUpdate.id, {
        ...yogurtToUpdate,
        price: yogurtToUpdate.price + 1,
        stock: yogurtToUpdate.stock + 10
      });
      setResult(response);
    } else {
      setResult({ success: false, error: 'No yogurts found to update' });
    }
    setLoading(false);
  };

  const testDeleteYogurt = async () => {
    setLoading(true);
    // First get yogurts to find one to delete
    const yogurts = await getYogurts();
    if (yogurts.success && yogurts.data && yogurts.data.length > 0) {
      const yogurtToDelete = yogurts.data[0];
      const response = await deleteYogurt(yogurtToDelete.id);
      setResult(response);
    } else {
      setResult({ success: false, error: 'No yogurts found to delete' });
    }
    setLoading(false);
  };

  // Test order actions
  const testGetOrders = async () => {
    setLoading(true);
    const response = await getOrders();
    setResult(response);
    setLoading(false);
  };

  const testCreateOrder = async () => {
    setLoading(true);
    // First get yogurts to add to the order
    const yogurts = await getYogurts();
    if (yogurts.success && yogurts.data && yogurts.data.length > 0) {
      const yogurt = yogurts.data[0];
      const quantity = 2;
      const response = await createOrder({
        userId: null, // Guest order
        total: parseInt((yogurt.price * quantity).toFixed(0)),
        status: 'pending',
        items: [
          {
            yogurtId: yogurt.id,
            quantity,
            price: parseInt(yogurt.price.toFixed(0)),
            orderId: '' // This will be filled by the server action
          }
        ]
      });
      setResult(response);
    } else {
      setResult({ success: false, error: 'No yogurts found to create order with' });
    }
    setLoading(false);
  };

  const testUpdateOrderStatus = async () => {
    setLoading(true);
    // First get orders to find one to update
    const orders = await getOrders();
    if (orders.success && orders.data && orders.data.length > 0) {
      const orderToUpdate = orders.data[0];
      const newStatus = orderToUpdate.status === 'pending' ? 'completed' : 'pending';
      const response = await updateOrderStatus(orderToUpdate.id, newStatus);
      setResult(response);
    } else {
      setResult({ success: false, error: 'No orders found to update' });
    }
    setLoading(false);
  };

  const testDeleteOrder = async () => {
    setLoading(true);
    // First get orders to find one to delete
    const orders = await getOrders();
    if (orders.success && orders.data && orders.data.length > 0) {
      const orderToDelete = orders.data[0];
      const response = await deleteOrder(orderToDelete.id);
      setResult(response);
    } else {
      setResult({ success: false, error: 'No orders found to delete' });
    }
    setLoading(false);
  };

  // Test order item actions
  const testGetOrderItems = async () => {
    setLoading(true);
    // First get orders to find one to get items for
    const orders = await getOrders();
    if (orders.success && orders.data && orders.data.length > 0) {
      const order = orders.data[0];
      const response = await getOrderItems(order.id);
      setResult(response);
    } else {
      setResult({ success: false, error: 'No orders found to get items for' });
    }
    setLoading(false);
  };

  const testAddOrderItem = async () => {
    setLoading(true);
    // First get orders and yogurts
    const orders = await getOrders();
    const yogurts = await getYogurts();
    
    if (orders.success && orders.data && orders.data.length > 0 &&
        yogurts.success && yogurts.data && yogurts.data.length > 0) {
      const order = orders.data[0];
      const yogurt = yogurts.data[0];
      
      const response = await addOrderItem({
        orderId: order.id,
        yogurtId: yogurt.id,
        quantity: 1,
        price: yogurt.price
      });
      setResult(response);
    } else {
      setResult({ success: false, error: 'No orders or yogurts found to add item' });
    }
    setLoading(false);
  };

  const testUpdateOrderItem = async () => {
    setLoading(true);
    // First get orders to find items
    const orders = await getOrders();
    if (orders.success && orders.data && orders.data.length > 0) {
      const order = orders.data[0];
      if (order.items && order.items.length > 0) {
        const itemToUpdate = order.items[0];
        const response = await updateOrderItem(itemToUpdate.id, {
          quantity: itemToUpdate.quantity + 1
        });
        setResult(response);
      } else {
        setResult({ success: false, error: 'No items found in order to update' });
      }
    } else {
      setResult({ success: false, error: 'No orders found to update items' });
    }
    setLoading(false);
  };

  const testRemoveOrderItem = async () => {
    setLoading(true);
    // First get orders to find one to remove items from
    const orders = await getOrders();
    if (orders.success && orders.data && orders.data.length > 0) {
      const order = orders.data[0];
      // Get order items for this order
      const orderItems = await getOrderItems(order.id);
      if (orderItems.success && orderItems.data && orderItems.data.length > 0) {
        const itemToRemove = orderItems.data[0];
        const response = await removeOrderItem(itemToRemove.id);
        setResult(response);
      } else {
        setResult({ success: false, error: 'No items found in order to remove' });
      }
    } else {
      setResult({ success: false, error: 'No orders found to remove items from' });
    }
    setLoading(false);
  };

  // Test dashboard actions
  const testGetDashboardStats = async () => {
    setLoading(true);
    const response = await getDashboardStats();
    setResult(response);
    setLoading(false);
  };

  const testGetTopSellingYogurts = async () => {
    setLoading(true);
    const response = await getTopSellingYogurts(5); // Get top 5 selling yogurts
    setResult(response);
    setLoading(false);
  };

  const testGetRecentOrders = async () => {
    setLoading(true);
    const response = await getRecentOrders(5); // Get 5 most recent orders
    setResult(response);
    setLoading(false);
  };

  const testGetLowStockYogurts = async () => {
    setLoading(true);
    const response = await getLowStockYogurts(20, 5); // Get 5 yogurts with stock <= 20
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test des Actions Serveur</h1>
      
      {loading && <div className="mb-4 p-2 bg-blue-100 rounded">Chargement...</div>}
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Actions Utilisateurs</h2>
          <div className="space-y-2">
            <button onClick={testGetUsers} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">
              Obtenir Utilisateurs
            </button>
            <button onClick={testCreateUser} className="bg-green-500 text-white px-3 py-1 rounded mr-2">
              Créer Utilisateur
            </button>
            <button onClick={testUpdateUser} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">
              Modifier Utilisateur
            </button>
            <button onClick={testDeleteUser} className="bg-red-500 text-white px-3 py-1 rounded">
              Supprimer Utilisateur
            </button>
          </div>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Actions Yogurts</h2>
          <div className="space-y-2">
            <button onClick={testGetYogurts} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">
              Obtenir Yogurts
            </button>
            <button onClick={testCreateYogurt} className="bg-green-500 text-white px-3 py-1 rounded mr-2">
              Créer Yogurt
            </button>
            <button onClick={testUpdateYogurt} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">
              Modifier Yogurt
            </button>
            <button onClick={testDeleteYogurt} className="bg-red-500 text-white px-3 py-1 rounded">
              Supprimer Yogurt
            </button>
          </div>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Actions Commandes</h2>
          <div className="space-y-2">
            <button onClick={testGetOrders} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">
              Obtenir Commandes
            </button>
            <button onClick={testCreateOrder} className="bg-green-500 text-white px-3 py-1 rounded mr-2">
              Créer Commande
            </button>
            <button onClick={testUpdateOrderStatus} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">
              Modifier Statut Commande
            </button>
            <button onClick={testDeleteOrder} className="bg-red-500 text-white px-3 py-1 rounded">
              Supprimer Commande
            </button>
          </div>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Actions Articles Commande</h2>
          <div className="space-y-2">
            <button onClick={testGetOrderItems} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">
              Obtenir Articles
            </button>
            <button onClick={testAddOrderItem} className="bg-green-500 text-white px-3 py-1 rounded mr-2">
              Ajouter Article
            </button>
            <button onClick={testUpdateOrderItem} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">
              Modifier Article
            </button>
            <button onClick={testRemoveOrderItem} className="bg-red-500 text-white px-3 py-1 rounded">
              Supprimer Article
            </button>
          </div>
        </div>
        
        <div className="border p-4 rounded col-span-2">
          <h2 className="text-xl font-semibold mb-2">Actions Tableau de Bord</h2>
          <div className="space-y-2">
            <button onClick={testGetDashboardStats} className="bg-purple-500 text-white px-3 py-1 rounded mr-2">
              Obtenir Statistiques
            </button>
            <button onClick={testGetTopSellingYogurts} className="bg-purple-500 text-white px-3 py-1 rounded mr-2">
              Obtenir Yogurts les Plus Vendus
            </button>
            <button onClick={testGetRecentOrders} className="bg-purple-500 text-white px-3 py-1 rounded mr-2">
              Obtenir Commandes Récentes
            </button>
            <button onClick={testGetLowStockYogurts} className="bg-purple-500 text-white px-3 py-1 rounded">
              Obtenir Yogurts en Stock Bas
            </button>
          </div>
        </div>
      </div>
      
      {result && (
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Résultat</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
