import { type IconType } from 'react-icons';
import { CgCalendarDates } from 'react-icons/cg';
import { FaRegBuilding, FaRegIdCard } from 'react-icons/fa';
import { FaClockRotateLeft } from 'react-icons/fa6';
import { GoCodeReview, GoTag } from 'react-icons/go';
import { HiMiniUsers } from 'react-icons/hi2';
import { ImHammer2 } from 'react-icons/im';
import { LuDoorClosed, LuUserCog } from 'react-icons/lu';
import { MdOutlineBed } from 'react-icons/md';
import { PiMoneyWavy } from 'react-icons/pi';
import { RiServiceBellLine } from 'react-icons/ri';

export interface SideBarItem {
  name: string;
  path: string;
  icon: IconType;
}

export const sideBarItems: SideBarItem[] = [
  { name: "Chi nhánh", path: "branches", icon: FaRegBuilding },
  { name: "Loại phòng", path: "room-types", icon: MdOutlineBed  },
  { name: "Phòng", path: "rooms", icon: LuDoorClosed  },
  { name: "Giá phòng", path: "room-prices", icon: PiMoneyWavy },
  { name: "Ngày lễ", path: "holidays", icon: CgCalendarDates  },
  { name: "Dịch vụ", path: "services", icon: RiServiceBellLine  },
  {name: "Khuyến mãi", path: "promotions", icon: GoTag  },
  {name: "Tài khoản", path: "accounts", icon: LuUserCog  },
  {name: "Khách hàng", path: "customers", icon: HiMiniUsers },
  {name: "Nhân viên", path: "employees", icon: FaRegIdCard  },
  {name: "Lịch sử hoạt động", path: "history-transactions", icon: FaClockRotateLeft  },
  // {name: "Đánh giá", path: "reviews", icon: GoCodeReview  },
  // {name: "Hình phạt", path: "penalties", icon: ImHammer2  },
];