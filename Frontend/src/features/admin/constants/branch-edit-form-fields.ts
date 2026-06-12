import { rules } from "../../../shared/util/rules";

export const branchEditFormFields = [
    {
        name: "name",
        label: "Branch Name",
        placeholder: "Enter branch name",
        type: "text",
        rules:[
            {
                required: true,
                message: "Vui lòng nhập tên chi nhánh"
            }
        ]

    },
    {
        name: "city",
        label: "City",
        placeholder: "Enter city",
        type: "text",
        rules:[
            {
                required: true,
                message: "Vui lòng nhập thành phố"
            }
        ]
    },
    {
        name: "address",
        label: "Address",
        placeholder: "Enter address",
        type: "text",
        rules:[
            {
                required: true,
                message: "Vui lòng nhập địa chỉ"
            }
        ]
    },
    {
        name: "phone",
        label: "Phone Number",
        placeholder: "Enter phone number",
        type: "text",
        rules:[
            {
                required: true,
                message: "Vui lòng nhập số điện thoại"
            },
            rules.phone,
        ]
    },
    {
        name: "email",
        label: "Email",
        placeholder: "Enter email",
        type: "text",
        rules:[
            {
                required: true,
                message: "Vui lòng nhập email"
            },
            rules.email,
        ]
    },
    {
        name: "description",
        label: "Description",
        placeholder: "Enter description",
        type: "text"
    },
    {
        name: "is_active",
        label: "Status",
        placeholder: "Select status",
        type: "select",
        options: [
            { label: "Active", value: true },
            { label: "Inactive", value: false },
        ],
        rules:[
            {
                required: true,
                message: "Vui lòng chọn trạng thái"
            }
        ]
    }
]