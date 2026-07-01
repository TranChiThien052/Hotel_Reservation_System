
import { FaRegUserCircle } from 'react-icons/fa';

const EmployeeHeader = () => {
  return (
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between w-full h-16 shadow relative px-7">
          <div className="flex gap-2 items-center justify-items-end h-full">
              <p className="font-bold text-2xl text-orange-400 w-full">Aurora</p>
              <p className="text-gray-600 font-bold text-xl w-full">Dashboard</p>
          </div>
  
          <div className="flex items-center gap-4">
            <div className="w-full h-full border-r pr-4">
              <FaRegUserCircle className="text-4xl text-gray-500"/>
            </div>
            <div className="flex flex-col items-start">
              <h2 className="font-bold text-2xl text-orange-400">Admin</h2>
              <p className="text-gray-600">admin@example.com</p>
            </div>
          </div>
        </div>
      </header>
    );
}

export default EmployeeHeader