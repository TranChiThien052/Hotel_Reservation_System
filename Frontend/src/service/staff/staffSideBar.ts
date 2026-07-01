import type { IconType } from "react-icons";
import { LuDoorClosed } from "react-icons/lu";

export interface StaffSideBarItem {
    name: string;
    path: string;
    icon: IconType;
}

export const staffSideBarItems: StaffSideBarItem[] = [
    {name: "Quản lý phòng", path: "rooms", icon: LuDoorClosed},
    {name: "Quản lý đặt phòng", path: "bookings", icon: LuDoorClosed},
];