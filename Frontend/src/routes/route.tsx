import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "../pages/client/index";
import ClientLayout from "../layout/clientLayout";

const route = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientLayout />}>
            <Route index element={<Index />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default route