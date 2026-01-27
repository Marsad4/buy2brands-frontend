import React from 'react';
import AdminSidebar from './admin/AdminSidebar';
import ProductsManagement from '../pages/admin/ProductsManagement';
import OrdersManagement from '../pages/admin/OrdersManagement';
import UsersManagement from '../pages/admin/UsersManagement';
import CatalogManagement from '../pages/admin/CatalogManagement';
import ReturnRequestsManagement from '../pages/admin/ReturnRequestsManagement';
import ShippingStructuresManagement from '../pages/admin/ShippingStructuresManagement';

const AdminPanel = ({
  activeTab,
  setActiveTab,
  onBackToStore,
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder
}) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBackToStore={onBackToStore}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === 'products' && (
            <ProductsManagement
              products={products}
              onAddProduct={onAddProduct}
              onEditProduct={onEditProduct}
              onDeleteProduct={onDeleteProduct}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersManagement
              orders={orders}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onDeleteOrder={onDeleteOrder}
            />
          )}

          {activeTab === 'users' && (
            <UsersManagement />
          )}

          {activeTab === 'catalog' && (
            <CatalogManagement />
          )}

          {activeTab === 'returns' && (
            <ReturnRequestsManagement />
          )}

          {activeTab === 'shipping' && (
            <ShippingStructuresManagement />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
