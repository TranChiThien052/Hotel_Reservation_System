import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "../../features/client/index";
import ClientLayout from "../../app/layout/clientLayout";
import AdminLayout from "../../app/layout/adminLayout";
import Branch from "../../features/admin/pages/branch";
import BranchForm from "../../features/admin/pages/branchForm";

const route = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientLayout />}>
            <Route index element={<Index />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Branch/>} />
          <Route path="branches" element={<Branch />} />
          <Route path="branches/add" element={<BranchForm />} />
          <Route path="branches/edit/:id" element={<BranchForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default route