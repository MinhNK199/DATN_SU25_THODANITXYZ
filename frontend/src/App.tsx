import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import ClientLayout from './layout/ClientLayout';
import Home from './pages/client/Home';
import PrivateRouteAdmin from "./components/privateRouteAdmin";
import AdminLayout from "./layout/admin";
import Login from "./components/Login";
import Register from "./components/Register";
import RegisterAdmin from "./components/DkyAdmin";
import ProductList from "./components/admin/products/ProductList";
import ProductDetail from "./components/admin/products/ProductDetail";
import ProductAdd from "./components/admin/products/ProductAdd";
import ProductEdit from "./components/admin/products/ProductEdit";
import CategoryList from "./components/admin/categories/CategoryList";
import CategoryAdd from "./components/admin/categories/CategoryAdd";
import CategoryEdit from "./components/admin/categories/CategoryEdit";
import CategoryDetail from "./components/admin/categories/CategoryDetail";
import UserList from "./components/admin/users/UserList";
import UserEdit from "./components/admin/users/userEdit";
import UserDetail from "./components/admin/users/userDetail";
import Listadmin from "./components/admin/users/ListAdmin";
import BillList from "./components/admin/bill/BillList";
import BrandList from "./components/admin/brands/BrandList";
import BannerList from "./components/admin/Banner/BannerList";
import BannerAdd from "./components/admin/Banner/BannerAdd";
import BannerEdit from "./components/admin/Banner/BannerEdit";
import Activity from "./components/admin/activity/activity";
import RatingList from "./components/admin/rating/ratinglist";
import Dashboard from "./components/admin/dashboard";
import { Toaster } from "react-hot-toast";
import Cart from './pages/client/Cart';
import LoginClient from './pages/client/Login';
import Profile from './pages/client/Profile';
import ProductListClient from './pages/client/ProductList';
import ProductDetailClient from './pages/client/ProductDetail';
import About from './pages/client/About';
import Contact from './pages/client/Contact';
import FAQ from './pages/client/FAQ';
import Checkout from './pages/client/Checkout';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ToastContainer } from './components/client/ToastNotification';
import ProductComparison from './components/client/ProductComparison';
import ProductReviews from './components/client/ProductReviews';
import PromotionBanner from './components/client/PromotionBanner';

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <div className="App">
          <Routes>
            {/* Auth routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-dky" element={<RegisterAdmin />} />

            {/* Client Routes */}
            <Route path="/" element={<ClientLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<ProductListClient />} />
              <Route path="product/:id" element={<ProductDetailClient />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="login" element={<LoginClient />} />
              <Route path="profile" element={<Profile />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="compare" element={<ProductComparison />} />
              <Route path="reviews" element={<ProductReviews />} />
            </Route>
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={<PrivateRouteAdmin><AdminLayout /></PrivateRouteAdmin>}
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/edit/:id" element={<UserEdit />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="users/admin-list" element={<Listadmin />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/add" element={<ProductAdd />} />
              <Route path="products/detail/:id" element={<ProductDetail />} />
              <Route path="products/edit/:id" element={<ProductEdit />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="categories/add" element={<CategoryAdd />} />
              <Route path="categories/edit/:id" element={<CategoryEdit />} />
              <Route path="categories/:id" element={<CategoryDetail />} />
              <Route path="bills" element={<BillList />} />
              <Route path="brands" element={<BrandList />} />
              <Route path="banners" element={<BannerList />} />
              <Route path="banners/add" element={<BannerAdd />} />
              <Route path="banners/edit/:id" element={<BannerEdit />} />
              <Route path="activities" element={<Activity />} />
              <Route path="ratings" element={<RatingList />} />
            </Route>
          </Routes>
          
          {/* Global Components */}
          <PromotionBanner />
          <ToastContainer />
          <Toaster />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;