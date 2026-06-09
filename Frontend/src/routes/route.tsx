import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "../pages/client/index";
import ClientLayout from "../layout/clientLayout";
import AdminLayout from "../layout/adminLayout";
import Branch from "../pages/admin/branch";

const route = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientLayout />}>
            <Route index element={<Index />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Branch/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default route