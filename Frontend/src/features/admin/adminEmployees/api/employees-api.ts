import apiClient from "@/shared/lib/axios";
import type { EmployeeFormData } from "../types/employees-type";

export const employeesApi = {
    getAllEmployees: async () => {
        const res = await apiClient.get('/staff');
        return res.data;
    },
    getEmployeeById: async (id: string) => {
        const res = await apiClient.get(`/staff/${id}`);
        return res.data;
    },
    createEmployee: async (employeeData: EmployeeFormData) => {
        const res = await apiClient.post('/staff', employeeData);  
        return res.data;    
    },
    updateEmployee: async (id: string, employeeData: EmployeeFormData) => {
        const res = await apiClient.put(`/staff/${id}`, employeeData);
        return res.data;
    },
    deleteEmployee: async (id: string) => {
        const res = await apiClient.delete(`/staff/${id}`);
        return res.data;
    },
    getEmployeesByBranchId: async (branchId: string) => {
        const res = await apiClient.get(`/staff/branch/${branchId}`);
        return res.data;
    }
};