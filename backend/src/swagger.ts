import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Tài liệu API cho dự án Express.js',
    },
    tags: [
      { name: "Branches", description: "Quản lý chi nhánh" },
      { name: "RoomType", description: "Quản lý loại phòng" },
      { name: "Room", description: "Quản lý phòng" },
      { name: "RoomPrice", description: "Quản lý giá phòng" },
      { name: "RoomService", description: "Quản lý dịch vụ phòng" },
      { name: "Discount", description: "Quản lý giảm giá" },
      { name: "Account", description: "Quản lý tài khoản" },
      { name: "Customer", description: "Quản lý khách hàng" },
      { name: "Staff", description: "Quản lý nhân viên" },
      { name: "Booking", description: "Quản lý đặt phòng" },
      { name: "BookingService", description: "Quản lý dịch vụ đặt phòng" },
      { name: "CancellationRequest", description: "Quản lý yêu cầu hủy phòng" },
      { name: "HolidayDate", description: "Quản lý ngày lễ" },
      { name: "Invoice", description: "Quản lý hóa đơn" },
      { name: "Payment", description: "Quản lý thanh toán" },
      { name: "FineItem", description: "Quản lý các mục phạt" },
      { name: "InvoiceFine", description: "Quản lý các khoản phạt trong hóa đơn" },
      { name: "HistoryTransaction", description: "Quản lý giao dịch lịch sử" },
      { name: "Auth", description: "Quản lý xác thực" },
      { name: "RoomAvailability", description: "Tìm phòng trống" }
    ],
    components: {
      securitySchemes: {
        refresh_token: {
          type: 'token',
          in: 'cookie',
          name: 'refresh_token',
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token"
        }
      }
    },
    security: [
      { refresh_token: [] },
      { bearerAuth: [] }
    ]
  },
  apis: ['./src/app.ts', './src/routes/*.ts'],
}

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };