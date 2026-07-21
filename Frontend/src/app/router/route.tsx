import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "@/features/client/home/index";
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
import StaffBooking from "@/features/staff/staffBooking/pages/StaffBooking";
import StaffBookingDetails from "@/features/staff/staffBooking/pages/StaffBookingDetails";
import StaffInvoicePage from "@/features/staff/staffBooking/pages/StaffInvoicePage";
import StaffPaymentSuccess from "@/features/staff/staffBooking/pages/StaffPaymentSuccess";
import ManagerRooms from "@/features/manager/managerRooms/pages/ManagerRooms";
import Login from "@/features/auth/pages/Login";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import ManagementEmployees from "@/features/manager/managementEmployees/pages/managementEmployees";
import ManagerLayout from "../layout/components/ManagerLayout";
import ClientRooms from "@/features/client/rooms/pages/ClientRooms";
import ClientRoomTypeDetail from "@/features/client/rooms/pages/ClientRoomTypeDetail";
import ClientBooking from "@/features/client/booking/pages/ClientBooking";
import BookingSuccess from "@/features/client/booking/pages/BookingSuccess";
import BookingHistory from "@/features/client/profile/pages/bookingHistory";
import BookingDetails from "@/features/client/profile/pages/bookingDetails";
import UserProfile from "@/features/client/profile/pages/userProfile";
import HistoryTransactions from "@/features/admin/adminHistoryTransaction/pages/HistoryTransactions";
import CancellationRequest from "@/features/manager/managerCancellationRequest/pages/CancellationRequest";
import ManagerRoomPrices from "@/features/manager/managerRoomPrices/pages/ManagerRoomPrices";
import ManagerHistoryTransactions from "@/features/manager/managerHistoryTransactions/pages/ManagerHistoryTransactions";
import Dashboard from "@/features/dashboard/pages/Dashboard";
import ManagerRoomTypes from "@/features/manager/managementRoomTypes/pages/ManagerRoomTypes";
import Holiday from "@/features/admin/adminHolidays/pages/AdminHoliday";

const route = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route element={<ProtectedRoute requireAuth={false} />}>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Index />} />
          <Route path="rooms" element={<ClientRooms />} />
          <Route path="rooms/type/:typeId" element={<ClientRoomTypeDetail />} />

          <Route path="booking/:id" element={<ClientBooking />} />
          <Route path="booking/room-type/:typeId" element={<ClientBooking />} />
          <Route path="booking/success" element={<BookingSuccess />} />

          
          <Route path="profile" element={<UserProfile />} />
          <Route path="my-bookings" element={<BookingHistory />} />
          <Route path="my-bookings/:id" element={<BookingDetails />} />
        </Route>


        
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Branches />} />
            <Route path="branches" element={<Branches />} />
            <Route path="room-types" element={<RoomTypes />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="room-prices" element={<RoomPrices />} />
            <Route path="services" element={<Services />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="customers" element={<Customers />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="employees" element={<Employees />} />
            <Route path="history-transactions" element={<HistoryTransactions />} />
            <Route path="holidays" element={<Holiday />} />
          </Route>
        </Route>

        
        <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="rooms" element={<StaffRooms />} />
            <Route path="bookings" element={<StaffBooking />} />
            <Route path="bookings/:id" element={<StaffBookingDetails />} />
            <Route path="bookings/:id/invoice" element={<StaffInvoicePage />} />
            <Route path="payment/success" element={<StaffPaymentSuccess />} />
            <Route path="cancellation-requests" element={<CancellationRequest />} />
            <Route path="dashboard" element={<Dashboard />} />
          
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="rooms" element={<ManagerRooms />} />
            <Route path="bookings" element={<StaffBooking />} />
            <Route path="bookings/:id" element={<StaffBookingDetails />} />
            <Route path="bookings/:id/invoice" element={<StaffInvoicePage />} />
            <Route path="payment/success" element={<StaffPaymentSuccess />} />
            <Route path="management-employees" element={<ManagementEmployees />} />
            <Route path="cancellation-requests" element={<CancellationRequest />} />
            <Route path="room-prices" element={<ManagerRoomPrices />} />
            <Route path="history-transactions" element={<ManagerHistoryTransactions />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="roomTypes" element={<ManagerRoomTypes />} />
            <Route path="promotions" element={<Promotions />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
     

export default route