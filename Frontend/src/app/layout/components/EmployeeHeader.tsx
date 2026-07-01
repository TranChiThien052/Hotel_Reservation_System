import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { Dropdown} from "antd";
import { LogoutOutlined} from "@ant-design/icons";
import { logout } from "@/features/auth/store/auth-slice";
import { SlArrowDown, SlUser } from "react-icons/sl";

const EmployeeHeader = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => dispatch(logout()),
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="flex items-center justify-between w-full h-16 shadow relative px-7">
        <div className="flex gap-2 items-center justify-items-end h-full">
          <p className="font-bold text-2xl text-orange-400 w-full">Aurora</p>
          <p className="text-gray-600 font-bold text-xl w-full">Dashboard</p>
        </div>

        <div className="flex items-center gap-4 h-full">
          <SlUser className="text-orange-500 text-4xl" />
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer">
            {/* <UserAvatar size={46} /> */}

            <div className="flex flex-col leading-tight">
              <span className="text-orange-500 text-xl font-medium">
                {user?.staff?.full_name || user?.customers?.full_name || "Admin"}
              </span>
              <span className="text-sm text-right text-gray-400">{user?.role}</span>
            </div>
            <SlArrowDown className="text-orange-500" />
          </div>
        </Dropdown>
      
        </div>
      </div>
    </header>
  );
};

export default EmployeeHeader;
