import { type IconType } from 'react-icons';
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
  { name: "Branch", path: "", icon: FaRegBuilding },
  { name: "Room Types", path: "/courses", icon: MdOutlineBed  },
  { name: "Rooms", path: "/students", icon: LuDoorClosed  },
  { name: "Prices", path: "/prices", icon: PiMoneyWavy },
  { name: "Services", path: "/services", icon: RiServiceBellLine  },
  {name: "Promotions", path: "/promotions", icon: GoTag  },
  {name: "Accounts", path: "/accounts", icon: LuUserCog  },
  {name: "Customers", path: "/customers", icon: HiMiniUsers },
  {name: "Employees", path: "/employees", icon: FaRegIdCard  },
  {name: "Audit Logs", path: "/audit-logs", icon: FaClockRotateLeft  },
  {name: "Reviews", path: "/reviews", icon: GoCodeReview  },
  {name: "Penalties", path: "/penalties", icon: ImHammer2  },
];