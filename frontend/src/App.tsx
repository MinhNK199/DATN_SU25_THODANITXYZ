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
import OrderList from "./components/admin/order/OrderList";
import OrderDetail from "./pages/admin/OrderDetail";
import BrandList from "./components/admin/brands/BrandList";
import BannerList from "./components/admin/Banner/BannerList";
import BannerAdd from "./components/admin/Banner/BannerAdd";
import BannerEdit from "./components/admin/Banner/BannerEdit";
import Activity from "./components/admin/activity/activity";
import RatingList from "./components/admin/rating/ratinglist";
import Dashboard from "./components/admin/dashboard";
import VariantList from "./components/admin/variants/VariantList";
import VariantAdd from "./components/admin/variants/VariantAdd";
import VariantEdit from "./components/admin/variants/VariantEdit";
import VariantDetail from "./components/admin/variants/VariantDetail";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from './components/client/ModernNotification';
import Cart from './pages/client/Cart';
import ProductListClient from './pages/client/ProductList';
import ProductDetailClient from './pages/client/ProductDetail';
import About from './pages/client/About';
import Contact from './pages/client/Contact';
import FAQ from './pages/client/FAQ';
import Checkout from './pages/client/Checkout';
import CheckoutShippingPage from './pages/client/CheckoutShippingPage';
import CheckoutPaymentPage from './pages/client/CheckoutPaymentPage';
import CheckoutReviewPage from './pages/client/CheckoutReviewPage';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import ProductComparison from './components/client/ProductComparison';
import ProductReviews from './components/client/ProductReviews';
import PromotionBanner from './components/client/PromotionBanner';
import ScrollToTop from './components/ScrollToTop';
import TestAPI from './components/client/TestAPI';
import TestLogin from './components/client/TestLogin';
import TestProductAPI from './components/client/TestProductAPI';
import LoginSuccess from './components/LoginSuccess';
import VoucherAdd from './components/admin/vouchers/VoucherAdd';
import VoucherList from './components/admin/vouchers/VoucherList';
import CouponList from './components/admin/coupons/CouponList';
import CouponAdd from './components/admin/coupons/CouponAdd';
import CouponEdit from './components/admin/coupons/CouponEdit';
import BlogPage from './pages/admin/BlogPage';
import ChatPage from './pages/admin/ChatPage';
import CheckoutSuccess from './pages/client/CheckoutSuccess';
import BlogList from './pages/client/BlogList';
import BlogDetail from './pages/client/BlogDetail';
import CheckoutFailed from './pages/client/CheckoutFailed';
import CheckoutStatus from './pages/client/CheckoutStatus';

// Import Profile components
import ProfileLayout from './pages/client/profile/components/ProfileLayout';
import PersonalInfo from './pages/client/profile/personal-info';
import ChangePassword from './pages/client/profile/change-password';
import Addresses from './pages/client/profile/addresses';
import Orders from './pages/client/profile/orders';
import OrderDetailProfile from './pages/client/profile/order-detail';
import Wishlist from './pages/client/profile/wishlist';
import Notifications from './pages/client/profile/notifications';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <WishlistProvider>
              <ChatProvider>
            <ScrollToTop />
            <Routes>
            {/* Test routes */}
            <Route path="/test-api" element={<TestAPI />} />
            <Route path="/test-login" element={<TestLogin />} />
            <Route path="/test-product-api" element={<TestProductAPI />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/login-success" element={<LoginSuccess />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-dky" element={<RegisterAdmin />} />
            <Route path="/admin-list" element={<Listadmin />} />

            {/* Client Routes */}
            <Route path="/" element={<ClientLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<ProductListClient />} />
              <Route path="product/:id" element={<ProductDetailClient />} />
              <Route path="cart" element={<Cart />} />
                             <Route path="checkout" element={<Checkout />} />
              <Route path="checkout/shipping" element={<CheckoutShippingPage />} />
              <Route path="checkout/payment" element={<CheckoutPaymentPage />} />
              <Route path="checkout/review" element={<CheckoutReviewPage />} />
              <Route path="checkout/status" element={<CheckoutStatus />} />
              <Route path="checkout/success" element={<CheckoutSuccess />} />
              <Route path="checkout/failed" element={<CheckoutFailed />} />
              <Route path="about" element={<About />} />  
              <Route path="contact" element={<Contact />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="compare" element={<ProductComparison />} />
              <Route path="reviews" element={<ProductReviews />} />
              <Route path="blogs" element={<BlogList />} />
              <Route path="blog/:slug" element={<BlogDetail />} />
              
              {/* Profile nested routes */}
              <Route path="profile" element={<ProfileLayout />}>
                <Route index element={<PersonalInfo />} />
                <Route path="personal-info" element={<PersonalInfo />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetailProfile />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>
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
              <Route path="variants" element={<VariantList />} />
              <Route path="variants/add" element={<VariantAdd />} />
              <Route path="variants/edit/:id" element={<VariantEdit />} />
              <Route path="variants/detail/:id" element={<VariantDetail />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="categories/add" element={<CategoryAdd />} />
              <Route path="categories/edit/:id" element={<CategoryEdit />} />
              <Route path="categories/:id" element={<CategoryDetail />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="brands" element={<BrandList />} />
              <Route path="banners" element={<BannerList />} />
              <Route path="banners/add" element={<BannerAdd />} />
              <Route path="banners/edit/:id" element={<BannerEdit />} />
              <Route path="activities" element={<Activity />} />
              <Route path="ratings" element={<RatingList />} />
              <Route path="vouchers" element={<VoucherList />} />
              <Route path="vouchers/add" element={<VoucherAdd />} />
              <Route path="coupons" element={<CouponList />} />
              <Route path="coupons/add" element={<CouponAdd />} />
              <Route path="coupons/edit/:id" element={<CouponEdit />} />
              <Route path="blogs" element={<BlogPage />} />
              <Route path="chat" element={<ChatPage />} />
            </Route>
          </Routes>
          
          {/* Global Components */}
          <PromotionBanner />
          <Toaster />
              </ChatProvider>
            </WishlistProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </div>
  );
}

export default App;