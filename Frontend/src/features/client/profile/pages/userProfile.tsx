import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { customersApi } from '@/features/admin/adminCustomers/api/customers-api';
import type { Customer, CustomerFormData } from '@/features/admin/adminCustomers/types/customers-type';
import { getMeThunk } from '@/features/auth/store/auth-thunk';
import {
    FaRegUser, FaRegCalendarAlt, FaChevronRight,
    FaSave, FaEdit,
} from 'react-icons/fa';
import {
    MdOutlinePhone, MdOutlineMail, MdOutlineCreditCard,
    MdOutlinePublic, MdOutlineCake, MdOutlineHome,
    MdOutlinePersonOutline,
} from 'react-icons/md';
import { IoCheckmarkCircle } from 'react-icons/io5';

const formatDate = (str?: string | null) => {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
};

const InputField = ({
    label, icon, type = 'text', value, onChange, placeholder, disabled = false, required = false,
}: {
    label: string;
    icon: React.ReactNode;
    type?: string;
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
            {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{icon}</span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-all ${
                    disabled
                        ? 'border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed'
                        : 'border-gray-200 bg-white focus:ring-2 focus:ring-amber-300 focus:border-amber-400'
                }`}
            />
        </div>
    </div>
);

const UserProfile = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, initialized } = useAppSelector((state) => state.auth);
    const customerId = user?.customers?.id ?? null;
    const customerRole = user?.role === 'customer' ? 'customer' : null;

    const [profile, setProfile] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState<CustomerFormData>({
        full_name: '',
        phone: '',
        email: '',
        id_card_number: '',
        nationality: 'Việt Nam',
        date_of_birth: '',
        address: '',
    });

    const fetchProfile = useCallback(async () => {
        if (!customerId) { 
            setLoading(false); 
            setEditing(true); // Tự động bật chế độ chỉnh sửa/tạo mới nếu chưa có thông tin
            return; 
        }
        setLoading(true);
        try {
            const data: Customer = await customersApi.getCustomerById(customerId);
            console.log("fetched profile data", data);
            setProfile(data);
            setForm({
                full_name: data.full_name ?? '',
                phone: data.phone ?? '',
                email: data.email ?? '',
                id_card_number: data.id_card_number ?? '',
                nationality: data.nationality ?? 'Việt Nam',
                date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
                address: data.address ?? '',
            });
        } catch (err) {
            console.error('Lỗi khi lấy thông tin cá nhân:', err);
        } finally {
            setLoading(false);
        }
    }, [customerId]);
    console.log("profile", profile);
    console.log("user", user);

    useEffect(() => {
        if (initialized) fetchProfile();
    }, [initialized, fetchProfile]);

    const handleSave = async () => {
        if (!customerRole) return;
        setErrorMsg('');
        setSuccessMsg('');

        if (!form.full_name.trim() || !form.phone.trim()) {
            setErrorMsg('Vui lòng điền đầy đủ họ tên và số điện thoại.');
            return;
        }

        setSaving(true);
        try {
            if (customerId) {
                await customersApi.updateCustomer(customerId, form);
                setSuccessMsg('Cập nhật thông tin thành công!');
                setEditing(false);
                fetchProfile();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                const newCustomerData = {
                    ...form,
                    account_id: user?.id ?? ''
                };
                console.log("create form", newCustomerData);
                await customersApi.createCustomer(newCustomerData);
                setSuccessMsg('Tạo thông tin cá nhân thành công!');
                setEditing(false);
                // Tải lại thông tin cá nhân để redux cập nhật customerId mới
                await dispatch(getMeThunk()).unwrap();
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message ?? 'Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setForm({
                full_name: profile.full_name ?? '',
                phone: profile.phone ?? '',
                email: profile.email ?? '',
                id_card_number: profile.id_card_number ?? '',
                nationality: profile.nationality ?? 'Việt Nam',
                date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
                address: profile.address ?? '',
            });
        }
        setEditing(false);
        setErrorMsg('');
    };

    // Chưa init
    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Chưa đăng nhập
    if (!user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center flex flex-col items-center gap-5">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                        <FaRegUser className="text-amber-500 text-4xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Yêu cầu đăng nhập</h1>
                    <p className="text-gray-500 text-sm">Bạn cần đăng nhập để xem trang cá nhân.</p>
                    <button
                        onClick={() => navigate('/login?returnUrl=/profile')}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            </div>
        );
    }

    // Không phải customer
    if (user.role !== 'customer') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center flex flex-col items-center gap-5">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl">🚫</div>
                    <h1 className="text-2xl font-bold text-gray-900">Không có quyền truy cập</h1>
                    <p className="text-gray-500 text-sm">
                        Trang cá nhân chỉ dành cho tài khoản khách hàng.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Profile header banner */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 mb-6 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-18 h-18 bg-white/20 rounded-full flex items-center justify-center border-3 border-white/40 shadow-md p-4">
                            <FaRegUser className="text-white text-4xl" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-white">
                                {profile?.full_name || user.customers?.full_name || 'Chưa có tên'}
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">{user.username}</p>
                            <span className="inline-block mt-1.5 text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
                                Khách hàng
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick nav */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all p-4 flex items-center justify-between group cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                <FaRegCalendarAlt className="text-amber-500" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800 text-sm">Lịch sử đặt phòng</p>
                                <p className="text-xs text-gray-400">Xem tất cả đơn đặt phòng</p>
                            </div>
                        </div>
                        <FaChevronRight className="text-gray-300 group-hover:text-amber-400 transition-colors" />
                    </button>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <MdOutlinePersonOutline className="text-blue-500 text-lg" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">Tài khoản</p>
                            <p className="text-xs text-gray-400">{user.username}</p>
                        </div>
                    </div>
                </div>

                {/* Profile form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    {/* Card header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <MdOutlinePersonOutline className="text-amber-500 text-lg" />
                            Thông tin cá nhân
                        </h2>
                        {!editing && !loading && (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                            >
                                <FaEdit className="text-xs" />
                                Chỉnh sửa
                            </button>
                        )}
                    </div>

                    {/* Form body */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Success / Error messages */}
                                {successMsg && (
                                    <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                                        <IoCheckmarkCircle className="text-green-500 text-lg shrink-0" />
                                        {successMsg}
                                    </div>
                                )}
                                {errorMsg && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <InputField
                                            label="Họ và tên"
                                            icon={<MdOutlinePersonOutline />}
                                            value={form.full_name}
                                            onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
                                            placeholder="Nguyễn Văn A"
                                            disabled={!editing}
                                            required
                                        />
                                    </div>

                                    <InputField
                                        label="Số điện thoại"
                                        icon={<MdOutlinePhone />}
                                        type="tel"
                                        value={form.phone}
                                        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                                        placeholder="0901 234 567"
                                        disabled={!editing}
                                        required
                                    />

                                    <InputField
                                        label="Email"
                                        icon={<MdOutlineMail />}
                                        type="email"
                                        value={form.email}
                                        onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                                        placeholder="email@example.com"
                                        disabled={!editing}
                                    />

                                    <InputField
                                        label="CCCD / Hộ chiếu"
                                        icon={<MdOutlineCreditCard />}
                                        value={form.id_card_number}
                                        onChange={(v) => setForm((f) => ({ ...f, id_card_number: v }))}
                                        placeholder="012345678901"
                                        disabled={!editing}
                                    />

                                    <InputField
                                        label="Ngày sinh"
                                        icon={<MdOutlineCake />}
                                        type="date"
                                        value={form.date_of_birth}
                                        onChange={(v) => setForm((f) => ({ ...f, date_of_birth: v }))}
                                        disabled={!editing}
                                    />

                                    <InputField
                                        label="Quốc tịch"
                                        icon={<MdOutlinePublic />}
                                        value={form.nationality}
                                        onChange={(v) => setForm((f) => ({ ...f, nationality: v }))}
                                        placeholder="Việt Nam"
                                        disabled={!editing}
                                    />

                                    <div className="sm:col-span-2">
                                        <InputField
                                            label="Địa chỉ"
                                            icon={<MdOutlineHome />}
                                            value={form.address ?? ''}
                                            onChange={(v) => setForm((f) => ({ ...f, address: v }))}
                                            placeholder="Số nhà, đường, quận, thành phố..."
                                            disabled={!editing}
                                        />
                                    </div>
                                </div>

                                {/* Thông tin chỉ xem */}
                                {!editing && profile && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Thông tin bổ sung</p>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-400">Ngày sinh</p>
                                                <p className="font-semibold text-gray-700">{formatDate(profile.date_of_birth)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Quốc tịch</p>
                                                <p className="font-semibold text-gray-700">{profile.nationality || '—'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-400">Địa chỉ</p>
                                                <p className="font-semibold text-gray-700">{profile.address || '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons when editing */}
                                {editing && (
                                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                        {customerId && (
                                            <button
                                                onClick={handleCancel}
                                                disabled={saving}
                                                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                                            >
                                                Hủy
                                            </button>
                                        )}
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                                        >
                                            {saving ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <FaSave className="text-xs" />
                                            )}
                                            {saving ? 'Đang lưu...' : customerId ? 'Lưu thay đổi' : 'Tạo thông tin'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
