import type { IconType } from "react-icons";
import { LuDoorClosed } from "react-icons/lu";

export interface ManagerSideBarItem {
    name: string;
    path: string;
    icon: IconType;
}

export const managerSideBarItems: ManagerSideBarItem[] = [
    {name: "Dashboard", path: "dashboard", icon: LuDoorClosed},
    {name: "Quản lý đặt phòng", path: "bookings", icon: LuDoorClosed},
    {name: "Quản lý nhân viên", path: "management-employees", icon: LuDoorClosed},
    {name: "Quản lý yêu cầu hủy", path: "cancellation-requests", icon: LuDoorClosed},
    {name: "Quản lý phòng", path: "rooms", icon: LuDoorClosed},
    {name: "Quản lý giá phòng", path: "room-prices", icon: LuDoorClosed},
    {name: "Quản lý loại phòng", path: "roomTypes", icon: LuDoorClosed},
    {name: "Lịch sử hoạt động", path: "history-transactions", icon: LuDoorClosed},
];