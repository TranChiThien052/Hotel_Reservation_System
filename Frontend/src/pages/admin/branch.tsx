import { CiCirclePlus } from "react-icons/ci"
import { FaRegBuilding } from "react-icons/fa"
import { IoIosCheckmarkCircleOutline } from "react-icons/io"
import { LuWrench } from "react-icons/lu"
import { Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';


interface DataType {
  key: string;
  branchName: string;
  address: string;
  phoneNumber: number;
  manager: string;
  status: string;
  actions: string[];
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: 'Branch Name',
    dataIndex: 'branchName',
    key: 'branchName',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Phone Number',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
  },
  {
    title: 'Manager',
    dataIndex: 'manager',
    key: 'manager',
  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
    render: (text) => (
      <Tag color={text === 'active' ? 'green' : text === 'maintenance' ? 'yellow' : 'red'}>
        {text.toUpperCase()}
      </Tag>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Space size="medium">
        <a>Something</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: '1',
    branchName: 'Branch 1',
    address: '123 Main St',
    phoneNumber: 1234567890,
    manager: 'John Doe',
    status: 'active',
    actions: ['Edit', 'Delete'],
  },
    {
    key: '2',
    branchName: 'Branch 2',
    address: '456 Elm St',
    phoneNumber: 9876543210,
    manager: 'Jane Smith',
    status: 'maintenance',
    actions: ['Edit', 'Delete'],
  },
  {
    key: '3',
    branchName: 'Branch 3',
    address: '789 Oak St',
    phoneNumber: 5551234567,
    manager: 'Bob Johnson',
    status: 'inactive',
    actions: ['Edit', 'Delete'],
  }
];


const branch = () => {
  return (
    <div className="p-7 flex flex-col gap-5 ">
        <div className="flex items-center justify-between mt-3">
            <div className="flex flex-col gap-1">
                <p className="text-3xl font-bold">Quản lý chi nhánh</p>
                <p className="text-gray-600">Danh sách các cơ sở lưu trú trong hệ thống khách sạn Aurora</p>
            </div>
            <div className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium">
                <CiCirclePlus />  Thêm chi nhánh mới
            </div>
        </div>

        <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
            <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 justify-between">
                    <span className="font-xl font-bold text-blue-500">Tổng chi nhánh</span>
                    <FaRegBuilding className="text-blue-500 text-2xl" />
                </div>
                <div className="text-2xl font-bold ">12</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 justify-between">
                    <span className="font-xl font-bold text-green-500">Đang hoạt động</span>
                    <IoIosCheckmarkCircleOutline className="text-green-500 text-2xl" />
                </div>
                <div className="text-2xl font-bold ">10</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 justify-between">
                    <span className="font-xl font-bold text-yellow-500">Đang bảo trì</span>
                    <LuWrench className="text-yellow-500 text-2xl" />
                </div>
                <div className="text-2xl font-bold">2</div>
            </div>
        </div>

        <div className="mt-5 border border-gray-300 rounded-lg">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-300 justify-between">
                <div className="flex items-center gap-4">
                    <div className="font-lg font-bold text-gray-700 border border-gray-300 p-2 rounded-lg">Trạng thái</div>
                    <div className="font-lg font-bold text-gray-700 border border-gray-300 p-2 rounded-lg">Khu vực</div>
                </div>
                <div className="flex items-center gap-3 pr-4">
                    <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
                    <p className="font-lg font-bold text-green-700 rounded-lg">{data.length}</p>
                </div>
            </div>
            <Table<DataType> columns={columns} dataSource={data}/>
        </div>
    </div>
  )
}

export default branch