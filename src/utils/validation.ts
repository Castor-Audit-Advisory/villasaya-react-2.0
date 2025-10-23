import { z } from 'zod';

// User validation schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(['landlord', 'property_agent', 'tenant', 'staff', 'admin']).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const VillaUserSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['landlord', 'property_agent', 'tenant', 'staff', 'admin']),
  permissions: z.array(z.string()).optional(),
  joinedAt: z.string().datetime().optional(),
});

// Villa validation schemas
export const VillaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Villa name is required').max(100),
  description: z.string().optional(),
  address: z.string().optional(),
  mainImage: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  amenities: z.array(z.string()).optional(),
  ownerId: z.string().uuid(),
  status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
  users: z.array(VillaUserSchema).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Task validation schemas
export const TaskSchema = z.object({
  id: z.string().uuid(),
  villaId: z.string().uuid(),
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().uuid().optional(),
  createdBy: z.string().uuid(),
  dueDate: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string().url()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Expense validation schemas
export const ExpenseItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
  total: z.number().nonnegative('Total cannot be negative'),
});

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  villaId: z.string().uuid(),
  category: z.enum(['maintenance', 'utilities', 'supplies', 'services', 'other']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency code must be 3 characters').default('USD'),
  description: z.string().min(1, 'Description is required').max(500),
  vendor: z.string().optional(),
  invoiceNumber: z.string().optional(),
  items: z.array(ExpenseItemSchema).optional(),
  date: z.string().datetime(),
  paidBy: z.string().uuid(),
  approvedBy: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'paid']).default('pending'),
  attachments: z.array(z.string().url()).optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Staff validation schemas
export const StaffMemberSchema = z.object({
  id: z.string().uuid(),
  villaId: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  role: z.string().min(1, 'Role is required').max(50),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  email: z.string().email().optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'seasonal']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  salary: z.number().nonnegative('Salary cannot be negative').optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  documents: z.array(z.string().url()).optional(),
  active: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Calendar event validation schemas
export const CalendarEventSchema = z.object({
  id: z.string().uuid(),
  villaId: z.string().uuid(),
  title: z.string().min(1, 'Event title is required').max(200),
  description: z.string().optional(),
  type: z.enum(['booking', 'maintenance', 'inspection', 'meeting', 'other']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  attendees: z.array(z.string().uuid()).optional(),
  createdBy: z.string().uuid(),
  recurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  reminders: z.array(z.object({
    type: z.enum(['email', 'push', 'sms']),
    minutesBefore: z.number().positive(),
  })).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Message validation schemas
export const MessageSchema = z.object({
  id: z.string().uuid(),
  villaId: z.string().uuid().optional(),
  senderId: z.string().uuid(),
  recipientId: z.string().uuid().optional(),
  channelId: z.string().uuid().optional(),
  content: z.string().min(1, 'Message content is required').max(5000),
  type: z.enum(['text', 'image', 'file', 'system']).default('text'),
  attachments: z.array(z.object({
    url: z.string().url(),
    type: z.string(),
    name: z.string(),
    size: z.number(),
  })).optional(),
  isRead: z.boolean().default(false),
  isEdited: z.boolean().default(false),
  editedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
});

// API request validation schemas
export const CreateVillaRequestSchema = VillaSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  users: true,
}).extend({
  name: z.string().min(1, 'Villa name is required').max(100),
  ownerId: z.string().uuid().optional(), // Make optional, use authenticated user if not provided
});

export const UpdateVillaRequestSchema = VillaSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateTaskRequestSchema = TaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
}).extend({
  title: z.string().min(1, 'Task title is required').max(200),
  villaId: z.string().uuid(),
});

export const UpdateTaskRequestSchema = TaskSchema.partial().omit({
  id: true,
  villaId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateExpenseRequestSchema = ExpenseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true,
}).extend({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500),
  villaId: z.string().uuid(),
});

export const UpdateExpenseRequestSchema = ExpenseSchema.partial().omit({
  id: true,
  villaId: true,
  paidBy: true,
  createdAt: true,
  updatedAt: true,
});

// Response validation schemas
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) => z.object({
  data: z.array(itemSchema),
  cursor: z.string().nullable(),
  hasMore: z.boolean(),
  totalCount: z.number().optional(),
});

// Validation helper functions
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

export function validatePartial(
  schema: z.ZodObject<any>,
  data: unknown
): { success: true; data: any } | { success: false; errors: z.ZodError } {
  try {
    const partialSchema = schema.partial();
    const validatedData = partialSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Type guards using Zod
export function isValidUser(data: unknown): data is z.infer<typeof UserSchema> {
  return UserSchema.safeParse(data).success;
}

export function isValidVilla(data: unknown): data is z.infer<typeof VillaSchema> {
  return VillaSchema.safeParse(data).success;
}

export function isValidTask(data: unknown): data is z.infer<typeof TaskSchema> {
  return TaskSchema.safeParse(data).success;
}

export function isValidExpense(data: unknown): data is z.infer<typeof ExpenseSchema> {
  return ExpenseSchema.safeParse(data).success;
}

// Export types inferred from schemas
export type ValidatedUser = z.infer<typeof UserSchema>;
export type ValidatedVilla = z.infer<typeof VillaSchema>;
export type ValidatedTask = z.infer<typeof TaskSchema>;
export type ValidatedExpense = z.infer<typeof ExpenseSchema>;
export type ValidatedStaffMember = z.infer<typeof StaffMemberSchema>;
export type ValidatedCalendarEvent = z.infer<typeof CalendarEventSchema>;
export type ValidatedMessage = z.infer<typeof MessageSchema>;