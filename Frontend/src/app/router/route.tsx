import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "../../features/client/index";
import ClientLayout from "../../app/layout/clientLayout";
import AdminLayout from "../../app/layout/adminLayout";
import Branch from "../../features/admin/adminBranch/pages/branch";
import RoomTypes from "../../features/admin/adminRoomTypes/pages/roomTypes";
import Rooms from "../../features/admin/adminRooms/pages/rooms";

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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default route