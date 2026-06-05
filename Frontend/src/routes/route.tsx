import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "../pages/client/index";
import ClientLayout from "../layout/clientLayout";
import AdminLayout from "../layout/adminLayout";

const route = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientLayout />}>
            <Route index element={<Index />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default route