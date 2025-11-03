import { pgTable, text, timestamp, jsonb, uuid, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'Landlord', 'Property Agent', 'Tenant', 'Staff'
  profileData: jsonb('profile_data').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Villas table
export const villas = pgTable('villas', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  location: text('location'),
  description: text('description'),
  leaseDetails: jsonb('lease_details').default({}),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Villa Users (junction table for many-to-many relationship)
export const villaUsers = pgTable('villa_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  villaId: uuid('villa_id').notNull().references(() => villas.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'admin', 'Landlord', 'Property Agent', 'Tenant', 'Staff'
  permissions: jsonb('permissions').default([]),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// User Settings table
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  general: jsonb('general').default({}),
  security: jsonb('security').default({}),
  notifications: jsonb('notifications').default({}),
  billing: jsonb('billing').default({}),
  integrations: jsonb('integrations').default({}),
  dataRetention: jsonb('data_retention').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  villaId: uuid('villa_id').notNull().references(() => villas.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'), // 'pending', 'in-progress', 'completed', 'cancelled'
  priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
  assignedTo: uuid('assigned_to').references(() => users.id),
  dueDate: timestamp('due_date'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Expenses table
export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  villaId: uuid('villa_id').notNull().references(() => villas.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  amount: text('amount').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
  receiptUrl: text('receipt_url'),
  submittedBy: uuid('submitted_by').notNull().references(() => users.id),
  approvedBy: uuid('approved_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  villaId: uuid('villa_id').notNull().references(() => villas.id, { onDelete: 'cascade' }),
  threadId: text('thread_id').notNull(),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  attachments: jsonb('attachments').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Staff Attendance table
export const staffAttendance = pgTable('staff_attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  villaId: uuid('villa_id').notNull().references(() => villas.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clockIn: timestamp('clock_in').notNull(),
  clockOut: timestamp('clock_out'),
  status: text('status').default('clocked-in'), // 'clocked-in', 'clocked-out'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Leave Requests table
export const leaveRequests = pgTable('leave_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  villaId: uuid('villa_id').notNull().references(() => villas.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  reason: text('reason'),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
  approvedBy: uuid('approved_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Invite Codes table
export const inviteCodes = pgTable('invite_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  villaId: uuid('villa_id').notNull().references(() => villas.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at'),
  maxUses: text('max_uses'),
  currentUses: text('current_uses').default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  villaUsers: many(villaUsers),
  createdVillas: many(villas),
  tasks: many(tasks),
  expenses: many(expenses),
  messages: many(messages),
  settings: many(userSettings),
}));

export const villasRelations = relations(villas, ({ one, many }) => ({
  creator: one(users, {
    fields: [villas.createdBy],
    references: [users.id],
  }),
  villaUsers: many(villaUsers),
  tasks: many(tasks),
  expenses: many(expenses),
  messages: many(messages),
}));

export const villaUsersRelations = relations(villaUsers, ({ one }) => ({
  villa: one(villas, {
    fields: [villaUsers.villaId],
    references: [villas.id],
  }),
  user: one(users, {
    fields: [villaUsers.userId],
    references: [users.id],
  }),
}));
