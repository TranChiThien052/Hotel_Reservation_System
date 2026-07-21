import type { IconType } from "react-icons";
import { FaClockRotateLeft, FaRegIdCard } from "react-icons/fa6";
import { GoTag } from "react-icons/go";
import { IoCloseCircleOutline } from "react-icons/io5";
import { LuDoorClosed, LuUserCog } from "react-icons/lu";
import { MdOutlineBed, MdOutlineDashboard } from "react-icons/md";
import { PiMoneyWavy } from "react-icons/pi";
import { TbBrandBooking } from "react-icons/tb";

export interface ManagerSideBarItem {
    name: string;
    path: string;
    icon: IconType;
}

export const managerSideBarItems: ManagerSideBarItem[] = [
    {name: "Dashboard", path: "dashboard", icon: MdOutlineDashboard },
    {name: "Quản lý đặt phòng", path: "bookings", icon: TbBrandBooking },
    {name: "Quản lý nhân viên", path: "management-employees", icon: FaRegIdCard},
    {name: "Quản lý tài khoản nhân viên", path: "accounts", icon: LuUserCog},
    {name: "Quản lý yêu cầu hủy", path: "cancellation-requests", icon: IoCloseCircleOutline },
    {name: "Quản lý phòng", path: "rooms", icon: LuDoorClosed},
    {name: "Quản lý giá phòng", path: "room-prices", icon: PiMoneyWavy},
    {name: "Quản lý loại phòng", path: "roomTypes", icon: MdOutlineBed},
    {name: "Quản lý khuyến mãi", path: "promotions", icon: GoTag},
    {name: "Lịch sử hoạt động", path: "history-transactions", icon: FaClockRotateLeft},
];