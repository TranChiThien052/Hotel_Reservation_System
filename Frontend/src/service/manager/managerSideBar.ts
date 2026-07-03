import type { IconType } from "react-icons";
import { LuDoorClosed } from "react-icons/lu";

export interface ManagerSideBarItem {
    name: string;
    path: string;
    icon: IconType;
}

export const managerSideBarItems: ManagerSideBarItem[] = [
    {name: "Quản lý phòng", path: "rooms", icon: LuDoorClosed},
    {name: "Quản lý đặt phòng", path: "bookings", icon: LuDoorClosed},
    {name: "Quản lý nhân viên", path: "management-employees", icon: LuDoorClosed},
];