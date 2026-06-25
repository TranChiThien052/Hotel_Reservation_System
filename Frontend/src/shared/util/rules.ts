import type { Rule } from 'antd/es/form';

type KeyUnion = 'email' | 'phone' | 'password';

export const rules: Record<KeyUnion, Rule> = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email không hợp lệ', 
  },

  phone: {
    pattern: /^[0-9]{10,11}$/,

    message: 'Số điện thoại không hợp lệ',
  },

  password: {

    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
    message: 'Mật khẩu không hợp lệ (Tối thiểu 8 ký tự, ít nhất một chữ cái viết hoa, một chữ cái viết thường và một ký tự đặc biệt)',

  },
};
