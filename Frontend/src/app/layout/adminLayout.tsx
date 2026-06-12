
import { NavLink, Outlet } from 'react-router-dom'
import AdminHeader from '../../app/layout/components/admin/adminHeader';
import AdminFooter from '../../app/layout/components/admin/adminFooter';
import {sideBarItems} from '../../service/admin/sideBar';


const adminLayout = () => {
  return (
    <div className='flex h-screen overflow-hidden'>
        <aside className='w-64 bg-gray-900 text-white p-5 overflow-y-auto'>
            <div className='text-3xl font-bold text-orange-400 text-center border-b border-gray-600'>Aurora</div>
            <nav className='mt-10 flex flex-col gap-2'>
                {sideBarItems.map((item) => (
    
                    <NavLink
                    to = {item.path}
                    className={({ isActive }) =>
                    isActive
                      ? "bg-orange-400 text-white p-2 rounded-lg mb-2 flex items-center gap-2"
                      : "p-2 rounded-lg hover:bg-gray-500 transition-colors mb-2 flex items-center gap-2"
                  }
                >
                      {item.icon({ className: "icon" })} {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
        <main className='flex-1 bg-gray-100 overflow-y-auto'>
            <AdminHeader />
            <Outlet/>
            <AdminFooter />
        </main>
    </div>
  )
}

export default adminLayout