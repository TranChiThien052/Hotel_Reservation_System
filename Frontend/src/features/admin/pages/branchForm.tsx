import { Form, Input, Button, Select, message, Spin } from "antd";
import type { FormProps } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { branchEditFormFields } from "../constants/branch-edit-form-fields";
import { createBranch, getBranchById, updateBranch } from "../api/admin-api";
import type { Branch } from "../types/branch-type";


const branchEdit = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); //Lấy ID branch từ URL params

  //Load dữ liệu branch khi component mount
  useEffect(() => {
    if (id) {
      loadBranchData();
    }
  }, [id]);

  //Load dữ liệu branch hiện tại
  const loadBranchData = async () => {
    console.log("Loading branch data for ID:", id);
    setInitialLoading(true);
    try {
        
      const response = await getBranchById(id!);
      form.setFieldsValue(response);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu chi nhánh");
    } finally {
      setInitialLoading(false);
    }
  };

  //Hàm xử lý submit form
  const handleSubmit: FormProps<Branch>["onFinish"] = async (values) => {
    setLoading(true);
    try {
      console.log("Form values:", values);
      
      // Gọi API update
      if (id) {
        await updateBranch(id!, values);
        message.success("Cập nhật chi nhánh thành công!");
      } else {
        //gọi API create
        await createBranch(values);
        message.success("Tạo chi nhánh thành công!");
      }
      
      // Quay về trang danh sách
      navigate("/admin/branches");
    } catch (error) {
      message.error("Cập nhật thất bại!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //render field động
  const renderField = (field: any) => {
    const { name, label, type, placeholder, rules, options } = field;

    if (type === "text") {
      return (
        <Form.Item key={name} name={name} label={label} rules={rules}>
          <Input placeholder={placeholder} />
        </Form.Item>
      );
    }

    if (type === "select") {
      return (
        <Form.Item key={name} name={name} label={label} rules={rules}>
          <Select placeholder={placeholder} options={options} />
        </Form.Item>
      );
    }

    if (type === "textarea") {
      return (
        <Form.Item key={name} name={name} label={label} rules={rules}>
          <Input.TextArea placeholder={placeholder} rows={4} />
        </Form.Item>
      );
    }

    return null;
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-7 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {id ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/*Render form fields động từ branchEditFormFields */}
          {branchEditFormFields.map((field) => renderField(field))}

          
          <div className="flex gap-3 mt-6">
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? "Cập nhật" : "Tạo mới"}
            </Button>
            <Button onClick={() => navigate("/admin/branches")}>
              Hủy
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default branchEdit;