import { prisma } from './prisma.ts';

export async function createTestBranch(overrides = {}) {
  return prisma.branches.create({
    data: {
      name: 'Test Branch',
      address: 'Test Location',
      city: 'Test City',
      description: 'Test branch for unit tests',
      is_active: true,
      ...overrides,
    },
  });
}

export async function createTestRoomType(branch_id, overrides = {}) {
  return prisma.room_types.create({
    data: {
      branch_id: branch_id,
      name: 'Test Room Type',
      description: 'Test room type for unit tests',
      max_guests: 2,
      images: [],
      is_active: true,
      ...overrides,
    }
  });
}

export async function createTestRoom(branch_id, room_type_id, overrides = {}) {
  return prisma.rooms.create({
    data: {
      branch_id: branch_id,
      room_type_id: room_type_id,
      room_number: "101",
      floor: 1,
      basic: [
        'Air Conditioning',
        'Free Wi-Fi',
        'Flat-screen TV',
        'Mini Fridge',
        'Private Bathroom'
      ],
      extra: [
        'Sea View',
        'Balcony',
        'Jacuzzi'
      ],
      status: "available",
      is_active: true,
      ...overrides,
    },
  });
}

export async function createTestRoomPrice(room_type_id, overrides = {}) {
  return prisma.room_prices.create({
    data: {
      room_type_id: room_type_id,
      price_per_day: 100.00,
      price_per_hour: 50.00,
      weekend_rate: 1.5,
      holiday_rate: 2,
      ...overrides,
    }
  });
}

export async function createTestRoomService(branch_id, overrides = {}) {
  return prisma.services.create({
    data: {
      branch_id: branch_id,
      name: 'Test Room Service',
      description: 'Test room service for unit tests',
      price: 20.00,
      unit: 'per item',
      is_active: true,
      ...overrides,
    },
  });
}

export async function createTestDiscount(overrides = {}) {
  return prisma.discounts.create({
    data: {
      code: 'TESTDISCOUNT',
      description: 'Test discount for unit tests',
      discount_type: 'percentage',
      discount_value: 10.00,
      min_order_value: 50.00,
      usage_limit: 100,
      valid_from: new Date(),
      valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
      is_active: true,
      ...overrides,
    },
  });
}

export async function createTestCustomer(overrides = {}) {
  return prisma.customers.create({
    data: {
      full_name: 'Test Customer',
      nationality: 'Test Nationality',
      date_of_birth: new Date('1990-01-01'),
      address: 'Test Address',
      ...overrides,
    },
  });
}

export async function createTestAccount(overrides = {}) {
  return prisma.accounts.create({
    data: {
      username: 'testuser',
      password_hash: 'testpassword',
      status: 'active',
      ...overrides,
    },
  });
}

export async function createTestStaff(branch_id, account_id, overrides = {}) {

  return prisma.staff.create({
    data: {
      full_name: 'Test Staff',
      position: 'staff',
      branch_id: branch_id,
      account_id: account_id,
      ...overrides,
    }
  });
}

export async function cleanDatabase() {
    await prisma.branches.deleteMany();
    await prisma.room_types.deleteMany();
    await prisma.rooms.deleteMany();
    await prisma.room_prices.deleteMany();
    await prisma.services.deleteMany();
    await prisma.discounts.deleteMany();
    await prisma.customers.deleteMany();
    await prisma.accounts.deleteMany();
    await prisma.staff.deleteMany();
}