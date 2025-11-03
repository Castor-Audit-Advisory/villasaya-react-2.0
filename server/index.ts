import { serve } from '@hono/node-server';
import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { db } from './db';
import { users, villas, villaUsers, userSettings, tasks, expenses, messages, staffAttendance, leaveRequests, inviteCodes } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

type User = typeof users.$inferSelect;

type AppContext = {
  Variables: {
    user: User;
  };
};

const app = new Hono<AppContext>();

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-this-secret-in-production-' + Math.random().toString(36)
);
const JWT_EXPIRY = '7d'; // 7 days

// CORS Configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000'];

app.use('*', logger());
app.use('*', cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// Helper Functions
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function createAccessToken(userId: string): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// Auth Middleware
async function authMiddleware(c: Context<AppContext>, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json({ error: 'No authorization header' }, 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return c.json({ error: 'No access token provided' }, 401);
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.userId as string)).limit(1);
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  c.set('user', user);
  return next();
}

// Default Settings
function getDefaultSettings() {
  return {
    general: {
      companyName: 'VillaSaya Properties',
      timezone: 'UTC+8',
      language: 'English',
      dateFormat: 'DD/MM/YYYY',
      currency: 'USD'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      passwordExpiry: '90',
      loginAttempts: '5',
      ipWhitelist: false
    },
    notifications: {
      emailNotifications: true,
      taskReminders: true,
      expenseAlerts: true,
      leaveRequests: true,
      maintenanceAlerts: true,
      tenantMessages: true
    },
    billing: {
      autoRenewal: true,
      invoiceEmail: 'billing@villasaya.com',
      paymentMethod: 'Credit Card',
      billingCycle: 'monthly'
    },
    integrations: {
      googleCalendar: false,
      microsoftCalendar: false,
      slackNotifications: false,
      stripePayments: false
    },
    dataRetention: {
      taskHistory: '12',
      expenseRecords: '60',
      messageArchive: '24',
      auditLogs: '36'
    }
  };
}

// Health Check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

// Auth Endpoints
app.post('/api/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields: email, password, name, role' }, 400);
    }

    // Check if user exists
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      name,
      role,
      profileData: {}
    }).returning();

    // Create default settings
    await db.insert(userSettings).values({
      userId: newUser.id,
      ...getDefaultSettings()
    });

    const token = await createAccessToken(newUser.id);
    
    return c.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      access_token: token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

app.post('/api/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = await createAccessToken(user.id);
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      access_token: token,
      refresh_token: token, // Using same token for both for simplicity
      expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    });
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

app.post('/api/signout', authMiddleware, async (c) => {
  return c.json({ success: true });
});

// User Profile Endpoints
app.get('/api/user/profile', authMiddleware, async (c) => {
  const user = c.get('user');
  
  const userVillas = await db
    .select({
      villaId: villaUsers.villaId,
      role: villaUsers.role,
      permissions: villaUsers.permissions
    })
    .from(villaUsers)
    .where(eq(villaUsers.userId, user.id));
  
  return c.json({
    profile: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profileData: user.profileData,
      villas: userVillas,
      createdAt: user.createdAt
    }
  });
});

app.put('/api/user/profile', authMiddleware, async (c) => {
  const user = c.get('user');
  const updates = await c.req.json();
  
  const [updated] = await db
    .update(users)
    .set({
      name: updates.name || user.name,
      profileData: updates.profileData || user.profileData,
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id))
    .returning();
  
  return c.json({ success: true, profile: updated });
});

// User Settings Endpoints
app.get('/api/user/settings', authMiddleware, async (c) => {
  const user = c.get('user');
  
  let [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1);
  
  if (!settings) {
    [settings] = await db.insert(userSettings).values({
      userId: user.id,
      ...getDefaultSettings()
    }).returning();
  }
  
  return c.json({ settings });
});

app.put('/api/user/settings', authMiddleware, async (c) => {
  const user = c.get('user');
  const newSettings = await c.req.json();
  
  const [updated] = await db
    .update(userSettings)
    .set({
      ...newSettings,
      updatedAt: new Date()
    })
    .where(eq(userSettings.userId, user.id))
    .returning();
  
  return c.json({ success: true, settings: updated });
});

// Villa Endpoints
app.post('/api/villas', authMiddleware, async (c) => {
  const user = c.get('user');
  const { name, address, location, description, leaseDetails } = await c.req.json();
  
  if (!name || !address) {
    return c.json({ error: 'Name and address are required' }, 400);
  }
  
  const [villa] = await db.insert(villas).values({
    name,
    address,
    location,
    description,
    leaseDetails: leaseDetails || {},
    createdBy: user.id
  }).returning();
  
  await db.insert(villaUsers).values({
    villaId: villa.id,
    userId: user.id,
    role: 'admin',
    permissions: ['all']
  });
  
  return c.json({ success: true, villa });
});

app.get('/api/villas', authMiddleware, async (c) => {
  const user = c.get('user');
  
  const userVillasList = await db
    .select({
      villa: villas,
      userRole: villaUsers.role
    })
    .from(villaUsers)
    .innerJoin(villas, eq(villaUsers.villaId, villas.id))
    .where(eq(villaUsers.userId, user.id));
  
  return c.json({ villas: userVillasList.map(v => ({ ...v.villa, userRole: v.userRole })) });
});

app.get('/api/villas/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const villaId = c.req.param('id');
  
  const [villa] = await db.select().from(villas).where(eq(villas.id, villaId)).limit(1);
  if (!villa) {
    return c.json({ error: 'Villa not found' }, 404);
  }
  
  const villaMembers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: villaUsers.role
    })
    .from(villaUsers)
    .innerJoin(users, eq(villaUsers.userId, users.id))
    .where(eq(villaUsers.villaId, villaId));
  
  return c.json({ villa: { ...villa, users: villaMembers } });
});

// Task Endpoints
app.get('/api/villas/:villaId/tasks', authMiddleware, async (c) => {
  const villaId = c.req.param('villaId');
  
  const taskList = await db.select().from(tasks).where(eq(tasks.villaId, villaId)).orderBy(desc(tasks.createdAt));
  
  return c.json({ tasks: taskList });
});

app.post('/api/villas/:villaId/tasks', authMiddleware, async (c) => {
  const user = c.get('user');
  const villaId = c.req.param('villaId');
  const taskData = await c.req.json();
  
  const [task] = await db.insert(tasks).values({
    villaId,
    title: taskData.title,
    description: taskData.description,
    status: taskData.status || 'pending',
    priority: taskData.priority || 'medium',
    assignedTo: taskData.assignedTo,
    dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
    createdBy: user.id
  }).returning();
  
  return c.json({ success: true, task });
});

// Expense Endpoints
app.get('/api/villas/:villaId/expenses', authMiddleware, async (c) => {
  const villaId = c.req.param('villaId');
  
  const expenseList = await db.select().from(expenses).where(eq(expenses.villaId, villaId)).orderBy(desc(expenses.createdAt));
  
  return c.json({ expenses: expenseList });
});

app.post('/api/villas/:villaId/expenses', authMiddleware, async (c) => {
  const user = c.get('user');
  const villaId = c.req.param('villaId');
  const expenseData = await c.req.json();
  
  const [expense] = await db.insert(expenses).values({
    villaId,
    category: expenseData.category,
    amount: expenseData.amount,
    description: expenseData.description,
    receiptUrl: expenseData.receiptUrl,
    status: 'pending',
    submittedBy: user.id
  }).returning();
  
  return c.json({ success: true, expense });
});

// Message Endpoints
app.get('/api/villas/:villaId/messages', authMiddleware, async (c) => {
  const villaId = c.req.param('villaId');
  const threadId = c.req.query('threadId');
  
  const conditions = threadId 
    ? and(eq(messages.villaId, villaId), eq(messages.threadId, threadId))
    : eq(messages.villaId, villaId);
  
  const messageList = await db
    .select()
    .from(messages)
    .where(conditions)
    .orderBy(desc(messages.createdAt));
  
  return c.json({ messages: messageList });
});

app.post('/api/villas/:villaId/messages', authMiddleware, async (c) => {
  const user = c.get('user');
  const villaId = c.req.param('villaId');
  const { threadId, content, attachments } = await c.req.json();
  
  const [message] = await db.insert(messages).values({
    villaId,
    threadId: threadId || generateId('thread'),
    senderId: user.id,
    content,
    attachments: attachments || []
  }).returning();
  
  return c.json({ success: true, message });
});

// Start server
const port = 3001;
console.log(`🚀 Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
