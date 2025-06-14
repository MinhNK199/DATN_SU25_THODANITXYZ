import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import PrivateRouteAdmin from "./components/privateRouteAdmin";
import AdminLayout from "./layout/admin";
import Login from "./components/Login";
import Register from "./components/Register";
import ProductList from "./components/admin/products/ProductList";
import ProductAdd from "./components/admin/products/ProductAdd";
import ProductEdit from "./components/admin/products/ProductEdit";
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

type Props = {}

const App = (props: Props) => {
  const routes = useRoutes([
    { path: "/", element: <Login />, },
    { path: "register", element: <Register /> },

    //client
    { path: "/client", element: <Hello /> },

    //Admin
    {
      path: "/admin", element: <PrivateRouteAdmin><AdminLayout /></PrivateRouteAdmin>, children: [
        { path: "", element: <Dashboard /> },
        { path: "user-list", element: <UserList /> },
        { path: "user-edit/:id", element: <UserEdit /> },
        { path: "user-detail/:id", element: <UserDetail /> },
        { path: "product-list", element: <ProductList /> },
        { path: "product-add", element: <ProductAdd /> },
        { path: "product-edit/:id", element: <ProductEdit /> },
        { path: "category-list", element: <CategoryList /> },
        { path: "category-add", element: <CategoryAdd /> },
        { path: "category-edit/:id", element: <CategoryEdit /> },
        { path: "bill-list", element: <BillList /> },
        { path: "brand", element: <BrandList /> },
        { path: "banner-list", element: <BannerList /> },
        { path: "banner-add", element: <BannerAdd /> },
        { path: "banner-edit/:id", element: <BannerEdit /> },
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