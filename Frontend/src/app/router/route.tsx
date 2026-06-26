import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "@/features/client/index";
import ClientLayout from "@/app/layout/ClientLayout";
import AdminLayout from "@/app/layout/AdminLayout";
import Branches from "@/features/admin/adminBranch/pages/Branch";
import RoomTypes from "@/features/admin/adminRoomTypes/pages/RoomTypes";
import Rooms from "@/features/admin/adminRooms/pages/Rooms";
import RoomPrices from "@/features/admin/adminRoomsPrices/pages/RoomPrices";
import Services from "@/features/admin/adminServices/pages/Services";
import Promotions from "@/features/admin/adminPromitions/pages/Promotions";
import Customers from "@/features/admin/adminCustomers/pages/Customers";
import Accounts from "@/features/admin/adminAccounts/pages/Accounts";
import Employees from "@/features/admin/adminEmployees/pages/Employees";
import StaffLayout from "../layout/components/StaffLayout";
import StaffRooms from "@/features/staff/staffRooms/pages/StaffRooms";

const route = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientLayout />}>
            <Route index element={<Index />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Branches/>} />
          <Route path="branches" element={<Branches />} />
          <Route path="room-types" element={<RoomTypes />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="room-prices" element={<RoomPrices />} />
          <Route path="services" element={<Services />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="customers" element={<Customers />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="employees" element={<Employees />} />
        </Route>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffRooms/>} />
          <Route path="rooms" element={<StaffRooms />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
     

export default route