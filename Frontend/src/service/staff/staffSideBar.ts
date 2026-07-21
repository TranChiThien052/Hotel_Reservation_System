import type { IconType } from "react-icons";
import { IoCloseCircleOutline } from "react-icons/io5";
import { LuDoorClosed } from "react-icons/lu";
import { MdOutlineDashboard } from "react-icons/md";
import { TbBrandBooking } from "react-icons/tb";

export interface StaffSideBarItem {
    name: string;
    path: string;
    icon: IconType;
}

export const staffSideBarItems: StaffSideBarItem[] = [
    {name: "Dashboard", path: "dashboard", icon: MdOutlineDashboard},
    {name: "Quản lý phòng", path: "rooms", icon: LuDoorClosed},
    {name: "Quản lý đặt phòng", path: "bookings", icon: TbBrandBooking},
    {name: "Quản lý yêu cầu hủy", path: "cancellation-requests", icon: IoCloseCircleOutline},
];