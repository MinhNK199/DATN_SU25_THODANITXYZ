import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import PrivateRouteAdmin from "./components/privateRouteAdmin";
import AdminLayout from "./layout/admin";
import Login from "./components/Login";
import Register from "./components/Register";
import ProductList from "./components/admin/products/ProductList";
import ProductAdd from "./components/admin/products/ProductAdd";
import ProductEdit from "./components/admin/products/ProductEdit";
import { Toaster } from "react-hot-toast";
import Hello from "./components/Hello";
import Dashboard from "./components/admin/dashboard";
import UserList from "./components/admin/users/UserList";
import UserDetail from "./components/admin/users/userDetail";

  

type Props = {}

const App = (props: Props) => {
  const routes = useRoutes([
    { path: "/", element: <Login/>, },
    { path: "register", element: <Register/> },
    
    //client
     { path: "/client", element: <Hello/>},
    
    //Admin
    { path: "/admin", element: <PrivateRouteAdmin><AdminLayout /></PrivateRouteAdmin>, children: [
      { path: "", element: <Dashboard /> },
        { path: "user-list", element: <UserList/> },
         { path: "user-detail/:id", element: <UserDetail/> },
        { path: "product-list", element: <ProductList/> },
        { path: "product-list", element: <ProductList/> },
        { path: "product-add", element: <ProductAdd/> },
        { path: "product-edit", element: <ProductEdit/> },
      ]}
       
  ])
  return (
    <div>
      {routes}
      <Toaster />
    </div>
  );
}

export default App;