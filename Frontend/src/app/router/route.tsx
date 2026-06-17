import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "../../features/client/index";
import ClientLayout from "../layout/ClientLayout";
import AdminLayout from "../layout/AdminLayout";
import Branch from "../../features/admin/adminBranch/pages/Branch";
import RoomTypes from "../../features/admin/adminRoomTypes/pages/RoomTypes";
import Rooms from "../../features/admin/adminRooms/pages/Rooms";
import RoomPrices from "@/features/admin/adminRoomsPrices/pages/RoomPrices";
import Services from "@/features/admin/adminServices/pages/Services";
import Promotions from "@/features/admin/adminPromitions/pages/Promotions";

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
          <Route path="room-types" element={<RoomTypes />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="room-prices" element={<RoomPrices />} />
          <Route path="services" element={<Services />} />
          <Route path="promotions" element={<Promotions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default route