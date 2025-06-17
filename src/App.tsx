import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import PrivateRouteAdmin from "./components/privateRouteAdmin";
import AdminLayout from "./layout/admin";
import Login from "./components/Login";
import Register from "./components/Register";
import ProductList from "./components/admin/products/ProductList";
import ProductAdd from "./components/admin/products/ProductAdd";
import ProductEdit from "./components/admin/products/ProductEdit";
import ProductDetail from "./components/admin/products/ProductDetail";
import CategoryList from "./components/admin/categories/CategoryList";
import CategoryAdd from "./components/admin/categories/CategoryAdd";
import CategoryEdit from "./components/admin/categories/CategoryEdit";
import { Toaster } from "react-hot-toast";
import Hello from "./components/Hello";
import Dashboard from "./components/admin/dashboard";
import UserList from "./components/admin/users/UserList";
import UserDetail from "./components/admin/users/userDetail";
import UserEdit from "./components/admin/users/userEdit";
import BillList from "./components/admin/bill/BillList";
import BrandList from "./components/admin/brands/BrandList";
import BannerList from "./components/admin/Banner/BannerList";
import BannerAdd from "./components/admin/Banner/BannerAdd";
import BannerEdit from "./components/admin/Banner/BannerEdit";
import Activity from "./components/admin/activity/activity";
import RatingList from "./components/admin/rating/ratinglist";
import Listadmin from "./components/admin/users/ListAdmin";
import RegisterAdmin from "./components/DkyAdmin";

type Props = {}

const App = (props: Props) => {
  const routes = useRoutes([
    // Auth routes
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/admin-dky", element: <RegisterAdmin /> },


    // Client routes
    { 
      path: "/", 
      element: <Hello />,
      children: [
        { path: "products", element: <ProductList /> },
        { path: "products/:id", element: <ProductDetail /> },
      ]
    },
    
    // Admin routes
    {
      path: "/admin", 
      element: <PrivateRouteAdmin><AdminLayout /></PrivateRouteAdmin>, 
      children: [
        { path: "", element: <Dashboard /> },
        { path: "users", element: <UserList /> },
        { path: "users/edit/:id", element: <UserEdit /> },
        { path: "users/:id", element: <UserDetail /> },
        { path: "users/admin-list", element: <Listadmin /> },
        { path: "products", element: <ProductList /> },
        { path: "products/add", element: <ProductAdd /> },
        { path: "products/detail/:id", element: <ProductDetail /> },
        { path: "products/edit/:id", element: <ProductEdit /> },
        { path: "categories", element: <CategoryList /> },
        { path: "categories/add", element: <CategoryAdd /> },
        { path: "categories/edit/:id", element: <CategoryEdit /> },
        { path: "bills", element: <BillList /> },
        { path: "brands", element: <BrandList /> },
        { path: "banners", element: <BannerList /> },
        { path: "banners/add", element: <BannerAdd /> },
        { path: "banners/edit/:id", element: <BannerEdit /> },
        { path: "activities", element: <Activity /> },
        { path: "ratings", element: <RatingList /> },
      ]
    }
  ])
  return (
    <div>
      {routes}
      <Toaster />
    </div>
  );
}

export default App;