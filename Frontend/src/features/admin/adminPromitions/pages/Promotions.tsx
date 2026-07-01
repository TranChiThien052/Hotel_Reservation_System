import { useFormModal } from "@/shared/hooks/useFormModal";
import type { Promotion, PromotionFormData } from "../types/promotions-types";
import { useCallback, useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { LuWrench } from "react-icons/lu";
import Table from "antd/es/table/Table";
import FormModal from "@/app/layout/components/admin/FormModal";
import { promotionsFormFields } from "../constants/promotions-form-fields";
import { FormModalModes } from "@/shared/types/type-form-mode";
import { promotionApi } from "../api/promotion-api";
import message from "antd/es/message";
import {
  Button,
  Dropdown,
  Input,
  Space,
  Tag,
  type MenuProps,
  type TableProps,
} from "antd";
import { IoSearch } from "react-icons/io5";

const defaultPromotionData: PromotionFormData = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 0,
  is_active: true,
  branch_id: "",
  min_order_value: 0,
  usage_limit: 0,
  valid_from: "",
  valid_to: "",
};

const Promotions = () => {
  const promotions = useFormModal<Promotion>();
  const [promotionsData, setPromotionsData] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await promotionApi.getPromotions();
      setPromotionsData(Array.isArray(data) ? data : []);
      setFilteredPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleStatusChange = async (
    id: string,
    updatedFields: Partial<PromotionFormData>,
  ) => {
    try {
      await promotionApi.updatePromotion(
        id,
        updatedFields as PromotionFormData,
      );
      message.success("Cập nhật trạng thái khuyến mãi thành công!");
      fetchPromotions();
    } catch (error) {
      message.error(
        "Có lỗi xảy ra khi cập nhật trạng thái khuyến mãi. Vui lòng thử lại.",
      );
    }
  };

  const handleSubmitForm = async (values: PromotionFormData) => {
    if (promotions.mode === FormModalModes.CREATE) {
      try {
        await promotionApi.createPromotion(values);
        message.success("Thêm khuyến mãi thành công!");
        fetchPromotions();
        promotions.close();
      } catch (error) {
        message.error("Có lỗi xảy ra khi thêm khuyến mãi. Vui lòng thử lại.");
      }
    } else if (
      promotions.mode === FormModalModes.UPDATE &&
      promotions.selectedRecord
    ) {
      try {
        await promotionApi.updatePromotion(
          promotions.selectedRecord?.id,
          values,
        );
        message.success("Cập nhật khuyến mãi thành công!");
        fetchPromotions();
        promotions.close();
      } catch (error) {
        message.error(
          "Có lỗi xảy ra khi cập nhật khuyến mãi. Vui lòng thử lại.",
        );
      }
    }
  };

  const handleSearch = (searchTerm: string) => {
    const filteres = promotionsData.filter((item) => 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.branches.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredPromotions(filteres);
  }

  const columns: TableProps<Promotion>["columns"] = [
    {
      title: "Mã khuyến mãi",
      key: "code",
      dataIndex: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      defaultSortOrder: "ascend",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Giá trị giảm giá",
      dataIndex: "discount_value",
      key: "discount_value",
      render: (text, record: Promotion) => {
        if (record.discount_type === "percentage") {
          return <span>{text}%</span>;
        }
        return <span>{text?.toLocaleString()} VND</span>;
      },
    },
    {
      title: "Loại giảm giá",
      dataIndex: "discount_type",
      key: "discount_type",
      render: (text) => {
        if (text === "percentage") {
          return <span>Phần trăm</span>;
        }
        return <span>Số tiền cố định</span>;
      }
    },
    {
      title: "Chi nhánh",
      key: "branches",
      render: (_, record) => <p>{record.branches?.name}</p>,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "valid_from",
      key: "valid_from",
      render: (text) => (
        <span>{text ? new Date(text).toLocaleDateString() : "-"}</span>
      )
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "valid_to",
      key: "valid_to",
      render: (text) => (
        <span>{text ? new Date(text).toLocaleDateString() : "-"}</span>
      )
    },
    {
      title: "Trạng thái",
      key: "is_active",
      dataIndex: "is_active",
      render: (text, record: Promotion) => {
        // Tạo items động với onClick cho từng branch
        const dynamicStatusItems: MenuProps["items"] = [
          {
            key: "active",
            label: <span className="text-green-600">Khả dụng</span>,
            onClick: () => handleStatusChange(record.id, { is_active: true }),
          },
          {
            key: "inactive",
            label: <span className="text-red-600">Không khả dụng</span>,
            onClick: () => handleStatusChange(record.id, { is_active: false }),
          },
        ];

        return (
          <Dropdown
            menu={{ items: dynamicStatusItems }}
            trigger={["click"]} //Click để hiển thị
            placement="bottomLeft"
          >
            <Tag color={text ? "green" : "red"} style={{ cursor: "pointer" }}>
              {text ? "Khả dụng" : "Không khả dụng"}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="medium">
          <Button onClick={() => promotions.openEdit(record)} type="primary">
            Chỉnh sửa
          </Button>
          <Button onClick={() => promotions.openView(record)} type="dashed">
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-7 flex flex-col gap-5 ">
      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-col gap-1">
          <p className="text-3xl font-bold">Quản lý khuyến mãi</p>
          <p className="text-gray-600">
            Danh sách các khuyến mãi trong hệ thống khách sạn Aurora
          </p>
        </div>
        <div
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
          onClick={() => promotions.openCreate()}
        >
          <CiCirclePlus /> Thêm khuyến mãi mới
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-blue-500">
              Tổng khuyến mãi
            </span>
            <FaRegBuilding className="text-blue-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {Array.isArray(promotionsData) ? promotionsData.length : 0}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-green-500">
              Khuyến mãi được kích hoạt
            </span>
            <IoIosCheckmarkCircleOutline className="text-green-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {Array.isArray(promotionsData)
              ? promotionsData.filter((item: Promotion) => item.is_active)
                  .length
              : 0}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-yellow-500">
              Khuyến mãi đã hết hạn
            </span>
            <LuWrench className="text-yellow-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold">
            {Array.isArray(promotionsData)
              ? promotionsData.filter((item: Promotion) => !item.is_active)
                  .length
              : 0}
          </div>
        </div>
      </div>

      <div className="mt-5 border border-gray-300 rounded-lg">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-300 justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm..."
              prefix={<IoSearch className="text-xl" />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 pr-4">
            <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
            <p className="font-lg font-bold text-green-700 rounded-lg">
              {Array.isArray(filteredPromotions) ? filteredPromotions.length : 0}
            </p>
          </div>
        </div>
        <Table<Promotion>
          columns={columns}
          dataSource={filteredPromotions}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>

      <FormModal
        isOpen={promotions.open}
        onClose={promotions.close}
        mode={promotions.mode}
        title={
          promotions.mode === FormModalModes.CREATE
            ? "Thêm khuyến mãi mới"
            : promotions.mode === FormModalModes.UPDATE
            ? "Chỉnh sửa khuyến mãi"
            : "Chi tiết khuyến mãi"
        }
        fields={promotionsFormFields}
        initialValues={promotions.selectedRecord || defaultPromotionData}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default Promotions;
