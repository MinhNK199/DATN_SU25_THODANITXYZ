import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProductEdit from "./admin/components/ProductEdit";
import ProductAdd from "./admin/components/ProductAdd";
import Admin from "./admin/pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin/product/add" element={<ProductAdd />} />
<Route path="/admin/product/edit/:id" element={<ProductEdit />} />
<Route path="/admin/product/delete/:id" element={<Admin />} />
<Route path="/admin" element={<Admin />} />
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;