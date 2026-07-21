import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { bookingApi } from '../api/booking-api';
import { promotionApi } from '@/features/admin/adminPromitions/api/promotion-api';
import { servicesApi } from '@/features/admin/adminServices/api/services-api';
import { bookingServiceApi } from '../api/booking-service-api';
import { branchApi } from '@/features/admin/adminBranch/api/admin-api';
import { roomTypesApi } from '@/features/admin/adminRoomTypes/api/roomTypes-api';
import { customersApi } from '@/features/admin/adminCustomers/api/customers-api';
import type { Booking } from '../types/booking-type';
import {
    Button, Spin, message, Select, Divider, Table, Modal, InputNumber, Input, Form, DatePicker
} from 'antd';
import dayjs from 'dayjs';
import { IoArrowBack } from 'react-icons/io5';
import {
    FaRegCalendarAlt, FaRegUser, FaTag, FaBuilding
} from 'react-icons/fa';
import {
    MdOutlineHotel, MdOutlinePhone, MdOutlineMail, MdOutlineCreditCard
} from 'react-icons/md';
import { HiOutlineClock } from 'react-icons/hi';
import { BsDoorOpen, BsDoorClosed, BsReceipt, BsPlus } from 'react-icons/bs';
import { LoginOutlined, LogoutOutlined, DeleteOutlined, EditOutlined, DollarOutlined } from '@ant-design/icons';

const formatVND = (n: number | string) => Number(n).toLocaleString('vi-VN') + 'đ';
const formatDate = (str?: string | null) => {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const formatDateTime = (str?: string | null) => {
    if (!str) return '—';
    return new Date(str).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const STATUS_CONFIG: Record<string, { label: string; antColor: string }> = {
    pending:     { label: 'Chờ xác nhận',  antColor: 'orange' },
    confirmed:   { label: 'Đã xác nhận',   antColor: 'blue' },
    checked_in:  { label: 'Đã nhận phòng', antColor: 'cyan' },
    checked_out: { label: 'Đã trả phòng',  antColor: 'purple' },
    completed:   { label: 'Hoàn thành',    antColor: 'green' },
    cancelled:   { label: 'Đã hủy',        antColor: 'red' },
};

const InfoRow = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        {icon && <span className="text-amber-400 text-base mt-0.5 shrink-0">{icon}</span>}
        <div className="flex-1 flex justify-between items-start gap-4">
            <span className="text-sm text-gray-500 shrink-0">{label}</span>
            <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
        </div>
    </div>
);

const StaffBookingDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const role = user?.role;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [allServices, setAllServices] = useState<any[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [bookingServices, setBookingServices] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [roomTypes, setRoomTypes] = useState<any[]>([]);

    const backPath   = role === 'manager' ? '/manager/bookings' : '/staff/bookings';
    const invoicePath = `${backPath}/${id}/invoice`;

    // Edit states
    const [editCustomerOpen, setEditCustomerOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [customerForm] = Form.useForm();
    const [saveCustomerLoading, setSaveCustomerLoading] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [form] = Form.useForm();

    // Add service states
    const [addServiceOpen, setAddServiceOpen] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [serviceQty, setServiceQty] = useState(1);
    const [addServiceLoading, setAddServiceLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [bookingData, services, allDiscounts, bkServices, allBranches, allRoomTypes] = await Promise.all([
                bookingApi.getBookingById(id),
                servicesApi.getAllServices(),
                promotionApi.getPromotions(),
                bookingServiceApi.getByBookingId(id),
                branchApi.getBranches(),
                roomTypesApi.getRoomTypes()
            ]);
            setBooking(bookingData);
            setAllServices(services);
            setDiscounts(allDiscounts);
            setBookingServices(bkServices);
            setBranches(allBranches);
            setRoomTypes(allRoomTypes);
        } catch (err) {
            console.error(err);
            message.error('Không thể tải dữ liệu đặt phòng.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchAll(); }, [fetchAll]);
    console.log('booking', booking);
    console.log('bookingServices', bookingServices);
    console.log("services", allServices);

    const handleCheckin = async () => {
        if (!booking) return;
        setActionLoading(true);
        try {
            await bookingApi.updateBooking(booking.id, { status: 'checked_in', actual_checkin_at: new Date().toISOString() } as any);
            message.success('Check-in thành công!');
            fetchAll();
        } catch { message.error('Check-in thất bại!'); }
        finally { setActionLoading(false); }
    };

    const handleCheckout = async () => {
        if (!booking) return;
        setActionLoading(true);
        try {
            await bookingApi.updateBooking(booking.id, { status: 'checked_out', actual_checkout_at: new Date().toISOString() } as any);
            message.success('Check-out thành công!');
            fetchAll();
        } catch { message.error('Check-out thất bại!'); }
        finally { setActionLoading(false); }
    };
    
    const handleStatusChange = async (newStatus: string) => {
        if (!booking || booking.status === newStatus) return;
        setActionLoading(true);
        try {
            const updatePayload: any = { status: newStatus };
            if (newStatus === 'checked_in') updatePayload.actual_checkin_at = new Date().toISOString();
            if (newStatus === 'checked_out') updatePayload.actual_checkout_at = new Date().toISOString();
            
            await bookingApi.updateBooking(booking.id, updatePayload);
            message.success(`Đã chuyển trạng thái thành: ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
            fetchAll();
        } catch { message.error('Cập nhật trạng thái thất bại!'); }
        finally { setActionLoading(false); }
    };

    const handleDiscountChange = async (discountId: string | null) => {
        if (!booking) return;
        setActionLoading(true);
        try {
            await bookingApi.updateBooking(booking.id, { discount_id: discountId ?? undefined } as any);
            message.success('Cập nhật giảm giá thành công!');
            fetchAll();
        } catch { message.error('Cập nhật giảm giá thất bại!'); }
        finally { setActionLoading(false); }
    };

    

    const handleOpenEdit = () => {
        if (!booking) return;
        form.setFieldsValue({
            branch_id: booking.branch_id,
            room_type_id: booking.room_type_id,
            booking_type: booking.booking_type,
            num_guests: booking.num_guests || 1,
            checkin_at: booking.checkin_at ? dayjs(booking.checkin_at) : null,
            checkout_at: booking.checkout_at ? dayjs(booking.checkout_at) : null,
            notes: booking.notes || '',
        });
        setIsEditOpen(true);
    };

    const handleOpenEditCustomer = () => {
        if (!booking || !booking.customers) return;
        setSelectedCustomerId(booking.customers.id);
        customerForm.setFieldsValue({
            full_name: booking.customers.full_name,
            phone: booking.customers.phone,
            email: booking.customers.email,
            id_card_number: booking.customers.id_card_number,
            nationality: booking.customers.nationality,
            address: booking.customers.address,
        });
        setEditCustomerOpen(true);
    }

    const handleSaveEdit = async (values: any) => {
        if (!booking) return;
        setActionLoading(true);
        try {
            const payload = {
                ...values,
                checkin_at: values.checkin_at ? values.checkin_at.toISOString() : undefined,
                checkout_at: values.checkout_at ? values.checkout_at.toISOString() : undefined,
            };
            await bookingApi.updateBooking(booking.id, payload as any);
            message.success('Cập nhật thông tin thành công!');
            setIsEditOpen(false);
            fetchAll();
        } catch { message.error('Cập nhật thông tin thất bại!'); }
        finally { setActionLoading(false); }
    };

    const handleSaveCustomerEdit = async (values: any) => {
        if (!selectedCustomerId) return;
        setSaveCustomerLoading(true);
        try {
            await customersApi.updateCustomer(selectedCustomerId, values);
            message.success('Cập nhật thông tin khách hàng thành công!');
            setEditCustomerOpen(false);
            setSelectedCustomerId(null);
            fetchAll();
        } catch (err) {
            console.error(err);
            message.error('Cập nhật thông tin khách hàng thất bại!');
        } finally {
            setSaveCustomerLoading(false);
        }
    }

    const handleAddService = async () => {
        if (!booking || !selectedServiceId) return;
        const svc = allServices.find((s: any) => s.id === selectedServiceId);
        if (!svc) return;
        setAddServiceLoading(true);
        try {
            await bookingServiceApi.create({
                booking_id: booking.id,
                service_id: selectedServiceId,
                quantity: serviceQty,
                unit_price: svc.price,
                total_amount: svc.price * serviceQty,
                added_by: user?.id,
            });
            message.success('Thêm dịch vụ thành công!');
            setAddServiceOpen(false);
            setSelectedServiceId(null);
            setServiceQty(1);
            fetchAll();
        } catch { message.error('Thêm dịch vụ thất bại!'); }
        finally { setAddServiceLoading(false); }
    };

    const handleDeleteService = async (bsId: string) => {
        try {
            await bookingServiceApi.delete(bsId);
            message.success('Đã xóa dịch vụ!');
            fetchAll();
        } catch { message.error('Xóa dịch vụ thất bại!'); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Spin size="large" tip="Đang tải..." />
        </div>
    );

    if (!booking) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy đơn đặt phòng</p>
                <button onClick={() => navigate(backPath)} className="mt-4 text-amber-600 underline cursor-pointer">Quay lại</button>
            </div>
        </div>
    );
    

    const isHourly = booking.booking_type === 'hourly';
    const customer = booking.customers;

    const checkinDate = new Date(booking.checkin_at);
    const checkoutDate = new Date(booking.checkout_at);
    const diffMs = checkoutDate.getTime() - checkinDate.getTime();
    const nights = isHourly ? 0 : Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const hours = isHourly ? Math.round(diffMs / (1000 * 60 * 60)) : 0;

    const totalAmount = Number(booking.total_amount  || 0);
    const totalPaid = booking.payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    const serviceTotal = bookingServices.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
    const amountDue = Math.max(0, totalAmount + serviceTotal - totalPaid);

    const canCheckin = booking.status === 'confirmed';
    const canCheckout = booking.status === 'checked_in';
    const canPay = booking.status === 'checked_out';
    const isEditable = booking.status !== 'cancelled' && booking.status !== 'completed';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Back */}
                <button
                    onClick={() => navigate(backPath)}
                    className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors mb-6 group cursor-pointer"
                >
                    <IoArrowBack className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Quay lại danh sách đặt phòng</span>
                </button>

                {/* Header */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <BsReceipt className="text-amber-500" />
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mã đặt phòng</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-wider">#{booking.booking_code}</h1>
                            <p className="text-xs text-gray-400 mt-1">Đặt lúc: {formatDateTime(booking.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2 self-start">
                            <span className="text-sm text-gray-500 font-medium">Trạng thái:</span>
                            <Select 
                                value={booking.status}
                                onChange={handleStatusChange}
                                disabled={actionLoading}
                                style={{ width: 160 }}
                                options={Object.entries(STATUS_CONFIG).map(([key, val]) => ({
                                    value: key,
                                    label: val.label,
                                }))}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-100">
                        {canCheckin && (
                            <Button
                                type="primary" icon={<LoginOutlined />}
                                loading={actionLoading} onClick={handleCheckin}
                                style={{ background: '#10b981', borderColor: '#10b981' }} size="large"
                            >
                                Check-in
                            </Button>
                        )}
                        {canCheckout && (
                            <Button
                                type="primary" icon={<LogoutOutlined />}
                                loading={actionLoading} onClick={handleCheckout}
                                style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }} size="large"
                            >
                                Check-out
                            </Button>
                        )}
                        {canPay && (
                            <Button
                                type="primary" icon={<DollarOutlined />}
                                onClick={() => navigate(invoicePath)}
                                style={{ background: '#f97316', borderColor: '#f97316' }} size="large"
                            >
                                Thanh toán &amp; Hóa đơn
                            </Button>
                        )}
                        {isEditable && (
                            <Button
                                icon={<EditOutlined />} size="large"
                                onClick={handleOpenEdit}
                            >
                                Chỉnh sửa thông tin
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Thông tin khách hàng */}
                    {customer && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                                <FaRegUser className="text-amber-500 text-base" /> Thông tin khách hàng
                            </h2>
                            <div className="mt-3">
                                <InfoRow label="Họ tên" value={customer.full_name} icon={<FaRegUser />} />
                                <InfoRow label="Điện thoại" value={customer.phone || '—'} icon={<MdOutlinePhone />} />
                                <InfoRow label="Email" value={customer.email || '—'} icon={<MdOutlineMail />} />
                                <InfoRow label="CCCD/Hộ chiếu" value={customer.id_card_number || '—'} icon={<MdOutlineCreditCard />} />
                                <InfoRow label="Quốc tịch" value={customer.nationality || '—'} />
                                {isEditable && (
                                    <div className="mt-4 flex justify-end">
                                        <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={handleOpenEditCustomer}>
                                            Cập nhật
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Thông tin đặt phòng */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                            <MdOutlineHotel className="text-amber-500 text-base" /> Thông tin đặt phòng
                        </h2>
                        <div className="mt-3">
                            <InfoRow label="Loại phòng" value={booking.room_types?.name ?? '—'} icon={<MdOutlineHotel />} />
                            <InfoRow label="Chi nhánh"  value={booking.branches?.name ?? '—'} icon={<FaBuilding />} />
                            <InfoRow label="Loại đặt" value={
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isHourly ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {isHourly ? 'Theo giờ' : 'Theo ngày'}
                                </span>
                            } icon={<FaTag />} />
                            <InfoRow label="Số khách" value={`${booking.num_guests} người`} icon={<FaRegUser />} />
                            <InfoRow
                                label={isHourly ? 'Bắt đầu dự kiến' : 'Nhận phòng dự kiến'}
                                value={isHourly ? formatDateTime(booking.checkin_at) : formatDate(booking.checkin_at)}
                                icon={<FaRegCalendarAlt />}
                            />
                            <InfoRow
                                label={isHourly ? 'Kết thúc dự kiến' : 'Trả phòng dự kiến'}
                                value={isHourly ? formatDateTime(booking.checkout_at) : formatDate(booking.checkout_at)}
                                icon={<FaRegCalendarAlt />}
                            />
                            <InfoRow label="Thời lượng" value={isHourly ? `${hours} giờ` : `${nights} đêm`} icon={<HiOutlineClock />} />
                            
                            {/* Hiển thị check-in/out thực tế rõ ràng hơn nếu đã thực hiện */}
                            {(booking.actual_checkin_at || booking.actual_checkout_at) && (
                                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Thực tế</h3>
                                    {booking.actual_checkin_at && (
                                        <InfoRow label="Nhận phòng lúc" value={<span className="text-blue-600 font-bold">{formatDateTime(booking.actual_checkin_at)}</span>} icon={<BsDoorOpen />} />
                                    )}
                                    {booking.actual_checkout_at && (
                                        <InfoRow label="Trả phòng lúc" value={<span className="text-purple-600 font-bold">{formatDateTime(booking.actual_checkout_at)}</span>} icon={<BsDoorClosed />} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Giảm giá */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FaTag className="text-amber-500 text-base" /> Giảm giá
                        </h2>
                        <Select
                            allowClear placeholder="Chọn mã giảm giá..."
                            style={{ width: '100%' }}
                            disabled={!isEditable || actionLoading}
                            value={booking.discount_id || undefined}
                            onChange={handleDiscountChange}
                            options={discounts.map((d: any) => ({
                                value: d.id,
                                label: `${d.code} — ${d.discount_type === 'percentage' ? d.discount_value + '%' : formatVND(d.discount_value)}`,
                            }))}
                        />
                        {booking.discount_amount && Number(booking.discount_amount) > 0 && (
                            <p className="text-xs text-green-600 mt-2">Đã giảm: <strong>{formatVND(booking.discount_amount)}</strong></p>
                        )}
                    </div>

                    {/* Chi phí */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                            <BsReceipt className="text-amber-500 text-base" /> Tóm tắt chi phí
                        </h2>
                        <div className="mt-3">
                            <InfoRow label="Tiền phòng" value={formatVND(totalAmount)} />
                            {serviceTotal > 0 && <InfoRow label="Phí dịch vụ" value={formatVND(serviceTotal)} />}
                            <Divider style={{ margin: '8px 0' }} />
                                <InfoRow label="Đã thanh toán"
                                    value={<span className="text-blue-600 font-bold">− {formatVND(totalPaid)}</span>} />
                            <div className="flex justify-between items-center py-3 mt-1 border-t-2 border-gray-100">
                                <span className="font-bold text-gray-900">Còn lại phải trả</span>
                                <span className="font-bold text-xl text-red-500">{formatVND(amountDue)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dịch vụ thêm */}
                <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <MdOutlineHotel className="text-amber-500 text-base" /> Dịch vụ đặt thêm
                        </h2>
                        {isEditable && (
                            <Button type="dashed" icon={<BsPlus className="text-lg" />} onClick={() => setAddServiceOpen(true)}>
                                Thêm dịch vụ
                            </Button>
                        )}
                    </div>
                    {bookingServices.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Chưa có dịch vụ nào được thêm.</p>
                    ) : (
                        <Table
                            dataSource={bookingServices} rowKey="id" pagination={false} size="small"
                            columns={[
                                { title: 'Dịch vụ', key: 'name', render: (_, r: any) => r.services?.name ?? '—' },
                                { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60 },
                                { title: 'Đơn giá', key: 'unit_price', render: (_, r: any) => formatVND(r.unit_price) },
                                { title: 'Thành tiền', key: 'total_amount', render: (_, r: any) => <strong>{formatVND(r.total_amount)}</strong> },
                                {
                                    title: '', key: 'action', width: 50,
                                    render: (_, r: any) => isEditable ? (
                                        <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteService(r.id)} />
                                    ) : null,
                                },
                            ]}
                        />
                    )}
                </div>
            </div>

            {/* Modal Edit Booking */}
            <Modal
                title="Chỉnh sửa thông tin đặt phòng"
                open={isEditOpen}
                onCancel={() => setIsEditOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={actionLoading}
                okText="Lưu thay đổi"
                cancelText="Hủy"
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleSaveEdit} className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <Form.Item name="branch_id" label="Chi nhánh" rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}>
                            <Select options={branches.map(b => ({ value: b.id, label: b.name }))} placeholder="Chọn chi nhánh" />
                        </Form.Item>
                        <Form.Item name="room_type_id" label="Loại phòng" rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}>
                            <Select options={roomTypes.map(rt => ({ value: rt.id, label: rt.name }))} placeholder="Chọn loại phòng" />
                        </Form.Item>
                        
                        <Form.Item name="booking_type" label="Loại đặt phòng" rules={[{ required: true }]}>
                            <Select options={[{ value: 'hourly', label: 'Theo giờ' }, { value: 'daily', label: 'Theo ngày' }]} />
                        </Form.Item>
                        <Form.Item name="num_guests" label="Số khách" rules={[{ required: true }]}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item name="checkin_at" label="Giờ nhận phòng dự kiến" rules={[{ required: true }]}>
                            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="checkout_at" label="Giờ trả phòng dự kiến" rules={[{ required: true }]}>
                            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <Form.Item name="notes" label="Ghi chú">
                        <Input.TextArea rows={3} placeholder="Nhập ghi chú đặt phòng..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Edit Customer */}
            <Modal
                title="Chỉnh sửa thông tin khách hàng"
                open={editCustomerOpen}
                onCancel={() => { setEditCustomerOpen(false); setSelectedCustomerId(null); }}
                onOk={() => customerForm.submit()}
                confirmLoading={saveCustomerLoading}
                okText="Lưu" cancelText="Hủy"
            >
                <Form form={customerForm} layout="vertical" className="mt-4" onFinish={handleSaveCustomerEdit}>
                    <Form.Item name="full_name" label="Tên khách hàng" rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}>
                        <Input placeholder="Nhập tên khách hàng..." />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                        <Input placeholder="Nhập số điện thoại..." />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email' }]}>
                        <Input placeholder="Nhập email..." />
                    </Form.Item>
                    <Form.Item name="id_card_number" label="CCCD/Hộ chiếu">
                        <Input placeholder="Nhập số CCCD/Hộ chiếu..." />
                    </Form.Item>
                    <Form.Item name="nationality" label="Quốc tịch">
                        <Input placeholder="Nhập quốc tịch..." />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input placeholder="Nhập địa chỉ..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add Service Modal */}
            <Modal
                title="Thêm dịch vụ"
                open={addServiceOpen}
                onCancel={() => { setAddServiceOpen(false); setSelectedServiceId(null); setServiceQty(1); }}
                onOk={handleAddService}
                confirmLoading={addServiceLoading}
                okText="Thêm" cancelText="Hủy"
            >
                <div className="flex flex-col gap-4 mt-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Chọn dịch vụ</label>
                        <Select
                            style={{ width: '100%' }} placeholder="Tìm dịch vụ..." showSearch
                            value={selectedServiceId || undefined} onChange={(v) => setSelectedServiceId(v)}
                            optionFilterProp="label"
                            options={allServices.map((s: any) => ({ value: s.id, label: `${s.name} — ${formatVND(s.price)}` }))}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Số lượng</label>
                        <InputNumber min={1} max={100} value={serviceQty} onChange={(v) => setServiceQty(v ?? 1)} style={{ width: '100%' }} />
                    </div>
                    {selectedServiceId && (() => {
                        const svc = allServices.find((s: any) => s.id === selectedServiceId);
                        return svc ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-sm text-amber-700">Thành tiền: <strong>{formatVND(svc.price * serviceQty)}</strong></p>
                            </div>
                        ) : null;
                    })()}
                </div>
            </Modal>
        </div>
    );
};

export default StaffBookingDetails;