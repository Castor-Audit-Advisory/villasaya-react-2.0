import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
] as const;

type EnvKey = (typeof REQUIRED_ENV_VARS)[number];

const getEnvVar = (key: EnvKey) => {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(
      `Missing required environment variable ${key}. Set it with "supabase secrets set ${key} <value>" before deploying.`,
    );
  }
  return value;
};

const ensureSupabaseConfig = () => {
  for (const key of REQUIRED_ENV_VARS) {
    getEnvVar(key);
  }
};

const createServiceRoleClient = () =>
  createClient(getEnvVar('SUPABASE_URL'), getEnvVar('SUPABASE_SERVICE_ROLE_KEY'));

const createAnonClient = (accessToken?: string) => {
  const headers = accessToken
    ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    : undefined;
  return createClient(getEnvVar('SUPABASE_URL'), getEnvVar('SUPABASE_ANON_KEY'), headers);
};

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Ensure required environment configuration is present
app.use('*', async (c, next) => {
  try {
    ensureSupabaseConfig();
  } catch (error) {
    console.error('Supabase configuration error:', error);
    return c.json({ error: (error as Error).message }, 500);
  }
  return next();
});

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: [
      "Content-Type", 
      "Authorization", 
      "x-csrf-token",
      "X-CSRF-Token",
      "apikey",
      "x-client-info"
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Helper to verify user authentication
async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return { error: 'No authorization header', user: null };
  }

  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    return { error: 'No access token provided', user: null };
  }

  try {
    const supabase = createAnonClient(accessToken);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return { error: 'Unauthorized', user: null };
    }

    return { error: null, user };
  } catch (error) {
    console.error('Error verifying user session:', error);
    return { error: 'Unauthorized', user: null };
  }
}

// Generate unique ID
function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Seed database with test users (FOR DEVELOPMENT ONLY)
app.post("/make-server-41a1615d/seed-test-users", async (c) => {
  // Security: Only allow in development environment
  const isDevelopment = Deno.env.get('ENABLE_DEV_ENDPOINTS') === 'true' || 
                        Deno.env.get('NODE_ENV') === 'development';
  
  if (!isDevelopment) {
    return c.json({ 
      error: 'This endpoint is disabled in production for security reasons',
      message: 'Development endpoints must be explicitly enabled via ENABLE_DEV_ENDPOINTS=true'
    }, 403);
  }
  
  try {
    const supabase = createServiceRoleClient();

    const testUsers = [
      {
        email: 'landlord@villasaya.com',
        password: 'VillaOwner2025!',
        name: 'John Landlord',
        role: 'Landlord',
      },
      {
        email: 'agent@villasaya.com',
        password: 'PropertyAgent2025!',
        name: 'Sarah Agent',
        role: 'Property Agent',
      },
      {
        email: 'tenant@villasaya.com',
        password: 'TenantUser2025!',
        name: 'Mike Tenant',
        role: 'Tenant',
      },
      {
        email: 'staff@villasaya.com',
        password: 'StaffMember2025!',
        name: 'Emma Staff',
        role: 'Staff',
      },
    ];

    const createdUsers: any[] = [];

    // Create users in Supabase Auth
    for (const testUser of testUsers) {
      try {
        // Try to create user
        const { data, error } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: { name: testUser.name },
        });

        if (error) {
          // If user already exists, try to get their ID
          if (error.message.includes('already registered') || error.message.includes('duplicate')) {
            console.log(`User ${testUser.email} already exists, fetching existing user...`);
            
            // Try to find existing user by email
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
            if (!listError && users) {
              const existingUser = users.find((u: any) => u.email === testUser.email);
              if (existingUser) {
                console.log(`Found existing user: ${testUser.email}`);
                
                // Get or create user profile
                let userProfile = await kv.get(`user:${existingUser.id}`);
                if (!userProfile) {
                  userProfile = {
                    id: existingUser.id,
                    email: testUser.email,
                    name: testUser.name,
                    villas: [],
                    createdAt: new Date().toISOString(),
                  };
                  await kv.set(`user:${existingUser.id}`, userProfile);
                }
                
                createdUsers.push({
                  id: existingUser.id,
                  email: testUser.email,
                  name: testUser.name,
                  role: testUser.role,
                });
                continue;
              }
            }
          }
          console.log(`Error creating ${testUser.email}:`, error.message);
          continue;
        }

        if (data.user) {
          // Create user profile in KV store
          const userProfile = {
            id: data.user.id,
            email: testUser.email,
            name: testUser.name,
            villas: [],
            createdAt: new Date().toISOString(),
          };
          
          await kv.set(`user:${data.user.id}`, userProfile);
          
          createdUsers.push({
            id: data.user.id,
            email: testUser.email,
            name: testUser.name,
            role: testUser.role,
          });
        }
      } catch (err) {
        console.log(`Error with ${testUser.email}:`, err);
      }
    }
    
    if (createdUsers.length === 0) {
      return c.json({ 
        error: 'Failed to create or find any users. Please check server logs.',
        success: false 
      }, 500);
    }

    // Create test villas
    const testVillas = [
      {
        name: 'Villa Sunset Paradise',
        location: 'Seminyak, Bali',
        description: 'Luxury 5-bedroom villa with ocean views',
      },
      {
        name: 'Villa Mountain Retreat',
        location: 'Ubud, Bali',
        description: 'Peaceful 3-bedroom villa in the mountains',
      },
    ];

    const createdVillas: any[] = [];

    for (const testVilla of testVillas) {
      const villaId = generateId('villa');
      const villa = {
        id: villaId,
        name: testVilla.name,
        location: testVilla.location,
        description: testVilla.description,
        users: createdUsers.map(user => ({
          userId: user.id,
          role: user.role,
          joinedAt: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
      };

      await kv.set(`villa:${villaId}`, villa);
      
      // Add villa to each user's profile
      for (const user of createdUsers) {
        const userProfile = await kv.get(`user:${user.id}`);
        if (userProfile) {
          userProfile.villas = [...(userProfile.villas || []), villaId];
          await kv.set(`user:${user.id}`, userProfile);
        }
      }

      createdVillas.push({
        id: villaId,
        name: villa.name,
        location: villa.location,
      });
    }

    return c.json({
      success: true,
      message: 'Test users and villas created successfully!',
      users: testUsers.map(u => ({
        email: u.email,
        password: u.password,
        role: u.role,
        name: u.name,
      })),
      villas: createdVillas,
    });
  } catch (error) {
    console.log('Error seeding database:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Health check endpoint
app.get("/make-server-41a1615d/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== AUTH ENDPOINTS ==========

// Sign up endpoint
app.post("/make-server-41a1615d/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields: email, password, name, role' }, 400);
    }
    
    const supabase = createServiceRoleClient();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Error creating user during sign up:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Create user profile in KV store
    const userId = data.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      role,
      profileData: {},
      createdAt: new Date().toISOString(),
      villas: [] // Array of {villaId, role, permissions}
    });
    
    return c.json({ success: true, userId });
  } catch (error) {
    console.log('Error in signup endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get current user profile
app.get("/make-server-41a1615d/user/profile", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    return c.json({ profile });
  } catch (error) {
    console.log('Error fetching user profile:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update user profile
app.put("/make-server-41a1615d/user/profile", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const updates = await c.req.json();
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    const updatedProfile = {
      ...profile,
      ...updates,
      id: profile.id, // Don't allow ID change
      email: profile.email, // Don't allow email change
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`user:${user.id}`, updatedProfile);
    
    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.log('Error updating user profile:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get user settings
app.get("/make-server-41a1615d/user/settings", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    let settings = await kv.get(`settings:${user.id}`);
    
    // If no settings exist, create and persist default settings
    if (!settings) {
      const defaultSettings = {
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
          invoiceEmail: user.email || 'billing@villasaya.com',
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
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Persist defaults to KV store for future sessions
      await kv.set(`settings:${user.id}`, defaultSettings);
      settings = defaultSettings;
    }
    
    return c.json({ settings });
  } catch (error) {
    console.log('Error fetching user settings:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Validate settings payload structure and types
function validateSettings(settings: any): { valid: boolean; error?: string } {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return { valid: false, error: 'Settings must be an object' };
  }
  
  // Define expected schema for each section
  const schema: Record<string, Record<string, string>> = {
    general: {
      companyName: 'string',
      timezone: 'string',
      language: 'string',
      dateFormat: 'string',
      currency: 'string'
    },
    security: {
      twoFactorAuth: 'boolean',
      sessionTimeout: 'string',
      passwordExpiry: 'string',
      loginAttempts: 'string',
      ipWhitelist: 'boolean'
    },
    notifications: {
      emailNotifications: 'boolean',
      taskReminders: 'boolean',
      expenseAlerts: 'boolean',
      leaveRequests: 'boolean',
      maintenanceAlerts: 'boolean',
      tenantMessages: 'boolean'
    },
    billing: {
      autoRenewal: 'boolean',
      invoiceEmail: 'string',
      paymentMethod: 'string',
      billingCycle: 'string'
    },
    integrations: {
      googleCalendar: 'boolean',
      microsoftCalendar: 'boolean',
      slackNotifications: 'boolean',
      stripePayments: 'boolean'
    },
    dataRetention: {
      taskHistory: 'string',
      expenseRecords: 'string',
      messageArchive: 'string',
      auditLogs: 'string'
    }
  };
  
  for (const section of Object.keys(schema)) {
    if (section in settings) {
      const sectionData = settings[section];
      
      // Section must be an object, not null or primitive
      if (!sectionData || typeof sectionData !== 'object' || Array.isArray(sectionData)) {
        return { valid: false, error: `Section '${section}' must be an object` };
      }
      
      // Validate field types
      for (const [fieldName, expectedType] of Object.entries(schema[section])) {
        if (fieldName in sectionData) {
          const value = sectionData[fieldName];
          
          // Check for null/undefined
          if (value === null || value === undefined) {
            return { valid: false, error: `Field '${fieldName}' in section '${section}' cannot be null or undefined` };
          }
          
          // Validate type
          const actualType = typeof value;
          if (actualType !== expectedType) {
            return { valid: false, error: `Field '${fieldName}' in section '${section}' must be ${expectedType}, got ${actualType}` };
          }
        }
      }
    }
  }
  
  return { valid: true };
}

// Deep merge helper function with safety checks
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      // Skip null or undefined values - preserve existing
      if (sourceValue === null || sourceValue === undefined) {
        return;
      }
      
      if (isObject(sourceValue)) {
        if (!(key in target) || !isObject(targetValue)) {
          output[key] = sourceValue;
        } else {
          output[key] = deepMerge(targetValue, sourceValue);
        }
      } else {
        output[key] = sourceValue;
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Update user settings
app.put("/make-server-41a1615d/user/settings", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const newSettings = await c.req.json();
    
    // Validate settings structure
    const validation = validateSettings(newSettings);
    if (!validation.valid) {
      return c.json({ error: validation.error || 'Invalid settings format' }, 400);
    }
    
    // Get existing settings (will include persisted defaults if they exist)
    const existingSettings = await kv.get(`settings:${user.id}`);
    
    if (!existingSettings) {
      return c.json({ error: 'Settings not initialized. Please reload the page.' }, 400);
    }
    
    // Deep merge new settings with existing ones to preserve all sections
    const updatedSettings = deepMerge(existingSettings, newSettings);
    updatedSettings.updatedAt = new Date().toISOString();
    
    await kv.set(`settings:${user.id}`, updatedSettings);
    
    return c.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.log('Error updating user settings:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== VILLA ENDPOINTS ==========

// Create villa
app.post("/make-server-41a1615d/villas", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { name, address, leaseDetails } = await c.req.json();
    
    if (!name || !address) {
      return c.json({ error: 'Missing required fields: name, address' }, 400);
    }
    
    const villaId = generateId('villa');
    const villa = {
      id: villaId,
      name,
      address,
      leaseDetails: leaseDetails || {},
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      users: [
        {
          userId: user.id,
          role: 'admin',
          permissions: ['all'],
          joinedAt: new Date().toISOString()
        }
      ]
    };
    
    await kv.set(`villa:${villaId}`, villa);
    
    // Update user's villas list
    const profile = await kv.get(`user:${user.id}`);
    if (profile) {
      profile.villas = profile.villas || [];
      profile.villas.push({ villaId, role: 'admin', permissions: ['all'] });
      await kv.set(`user:${user.id}`, profile);
    }
    
    return c.json({ success: true, villa });
  } catch (error) {
    console.log('Error creating villa:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all villas for current user
app.get("/make-server-41a1615d/villas", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile || !profile.villas || profile.villas.length === 0) {
      return c.json({ villas: [] });
    }
    
    const villaIds = profile.villas.map((v: any) => `villa:${v.villaId}`);
    const villas = await kv.mget(villaIds);
    
    return c.json({ villas: villas.filter(Boolean) });
  } catch (error) {
    console.log('Error fetching villas:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single villa
app.get("/make-server-41a1615d/villas/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.param('id');
    const villa = await kv.get(`villa:${villaId}`);
    
    if (!villa) {
      return c.json({ error: 'Villa not found' }, 404);
    }
    
    // Check if user has access to this villa
    const hasAccess = villa.users.some((u: any) => u.userId === user.id);
    
    if (!hasAccess) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    return c.json({ villa });
  } catch (error) {
    console.log('Error fetching villa:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update villa
app.put("/make-server-41a1615d/villas/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.param('id');
    const villa = await kv.get(`villa:${villaId}`);
    
    if (!villa) {
      return c.json({ error: 'Villa not found' }, 404);
    }
    
    // Check if user is admin
    const userRole = villa.users.find((u: any) => u.userId === user.id);
    if (!userRole || userRole.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const updates = await c.req.json();
    const updatedVilla = {
      ...villa,
      ...updates,
      id: villa.id, // Don't allow ID change
      users: villa.users, // Don't allow users change via this endpoint
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`villa:${villaId}`, updatedVilla);
    
    return c.json({ success: true, villa: updatedVilla });
  } catch (error) {
    console.log('Error updating villa:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete villa
app.delete("/make-server-41a1615d/villas/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.param('id');
    const villa = await kv.get(`villa:${villaId}`);
    
    if (!villa) {
      return c.json({ error: 'Villa not found' }, 404);
    }
    
    // Only creator can delete
    if (villa.createdBy !== user.id) {
      return c.json({ error: 'Only creator can delete villa' }, 403);
    }
    
    // Remove villa from all users
    for (const villaUser of villa.users) {
      const userProfile = await kv.get(`user:${villaUser.userId}`);
      if (userProfile && userProfile.villas) {
        userProfile.villas = userProfile.villas.filter((v: any) => v.villaId !== villaId);
        await kv.set(`user:${villaUser.userId}`, userProfile);
      }
    }
    
    await kv.del(`villa:${villaId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting villa:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Generate invite code
app.post("/make-server-41a1615d/villas/:id/invite", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.param('id');
    const { role } = await c.req.json();
    const villa = await kv.get(`villa:${villaId}`);
    
    if (!villa) {
      return c.json({ error: 'Villa not found' }, 404);
    }
    
    // Check if user is admin
    const userRole = villa.users.find((u: any) => u.userId === user.id);
    if (!userRole || userRole.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const inviteCode = generateId('invite');
    await kv.set(`invite:${inviteCode}`, {
      villaId,
      role,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });
    
    return c.json({ success: true, inviteCode });
  } catch (error) {
    console.log('Error generating invite code:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Join villa with invite code
app.post("/make-server-41a1615d/villas/join", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { inviteCode } = await c.req.json();
    const invite = await kv.get(`invite:${inviteCode}`);
    
    if (!invite) {
      return c.json({ error: 'Invalid invite code' }, 404);
    }
    
    // Check expiration
    if (new Date(invite.expiresAt) < new Date()) {
      return c.json({ error: 'Invite code expired' }, 400);
    }
    
    const villa = await kv.get(`villa:${invite.villaId}`);
    
    if (!villa) {
      return c.json({ error: 'Villa not found' }, 404);
    }
    
    // Check if user already in villa
    const alreadyMember = villa.users.some((u: any) => u.userId === user.id);
    if (alreadyMember) {
      return c.json({ error: 'Already a member of this villa' }, 400);
    }
    
    // Add user to villa
    villa.users.push({
      userId: user.id,
      role: invite.role,
      permissions: [],
      joinedAt: new Date().toISOString()
    });
    
    await kv.set(`villa:${invite.villaId}`, villa);
    
    // Update user profile
    const profile = await kv.get(`user:${user.id}`);
    if (profile) {
      profile.villas = profile.villas || [];
      profile.villas.push({ villaId: invite.villaId, role: invite.role, permissions: [] });
      await kv.set(`user:${user.id}`, profile);
    }
    
    return c.json({ success: true, villa });
  } catch (error) {
    console.log('Error joining villa:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== TASK ENDPOINTS ==========

// Create task
app.post("/make-server-41a1615d/tasks", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { villaId, title, description, assignedTo, supervisorId, dueDate, mandatory } = await c.req.json();
    
    if (!villaId || !title || !assignedTo || assignedTo.length === 0) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Verify access to villa
    const villa = await kv.get(`villa:${villaId}`);
    if (!villa || !villa.users.some((u: any) => u.userId === user.id)) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const taskId = generateId('task');
    const task = {
      id: taskId,
      villaId,
      title,
      description: description || '',
      assignedTo, // Array of user IDs
      supervisorId: assignedTo.length > 1 ? supervisorId : null,
      createdBy: user.id,
      status: 'pending',
      dueDate: dueDate || null,
      mandatory: mandatory || {},
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    
    await kv.set(`task:${taskId}`, task);
    await kv.set(`villa:${villaId}:task:${taskId}`, taskId);
    
    return c.json({ success: true, task });
  } catch (error) {
    console.log('Error creating task:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get tasks for villa
app.get("/make-server-41a1615d/villas/:id/tasks", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.param('id');
    const villa = await kv.get(`villa:${villaId}`);
    
    if (!villa || !villa.users.some((u: any) => u.userId === user.id)) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const taskKeys = await kv.getByPrefix(`villa:${villaId}:task:`);
    const taskIds = taskKeys.map((k: any) => `task:${k.value}`);
    const tasks = await kv.mget(taskIds);
    
    return c.json({ tasks: tasks.filter(Boolean) });
  } catch (error) {
    console.log('Error fetching tasks:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all tasks for user (across all villas)
app.get("/make-server-41a1615d/tasks", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile || !profile.villas || profile.villas.length === 0) {
      return c.json({ tasks: [] });
    }
    
    let allTasks: any[] = [];
    
    for (const villaRef of profile.villas) {
      const taskKeys = await kv.getByPrefix(`villa:${villaRef.villaId}:task:`);
      const taskIds = taskKeys.map((k: any) => `task:${k.value}`);
      const tasks = await kv.mget(taskIds);
      allTasks = allTasks.concat(tasks.filter(Boolean));
    }
    
    return c.json({ tasks: allTasks });
  } catch (error) {
    console.log('Error fetching all tasks:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update task (general update)
app.put("/make-server-41a1615d/tasks/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('id');
    const updates = await c.req.json();
    const task = await kv.get(`task:${taskId}`);
    
    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }
    
    const updatedTask = {
      ...task,
      ...updates,
      id: task.id, // Don't allow ID change
      villaId: task.villaId, // Don't allow villa change
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`task:${taskId}`, updatedTask);
    
    return c.json({ success: true, task: updatedTask });
  } catch (error) {
    console.log('Error updating task:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update task status
app.put("/make-server-41a1615d/tasks/:id/status", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('id');
    const { status } = await c.req.json();
    const task = await kv.get(`task:${taskId}`);
    
    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }
    
    // If marking complete and there's a supervisor, must be supervisor
    if (status === 'completed' && task.supervisorId && task.supervisorId !== user.id) {
      return c.json({ error: 'Only supervisor can mark task as complete' }, 403);
    }
    
    // If no supervisor, must be assigned to task
    if (status === 'completed' && !task.supervisorId && !task.assignedTo.includes(user.id)) {
      return c.json({ error: 'Only assigned staff can mark task as complete' }, 403);
    }
    
    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date().toISOString();
    }
    
    await kv.set(`task:${taskId}`, task);
    
    return c.json({ success: true, task });
  } catch (error) {
    console.log('Error updating task status:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== EXPENSE ENDPOINTS ==========

// Create expense
app.post("/make-server-41a1615d/expenses", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { villaId, title, amount, category, description, taskIds } = await c.req.json();
    
    if (!villaId || !title || !amount) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const villa = await kv.get(`villa:${villaId}`);
    if (!villa || !villa.users.some((u: any) => u.userId === user.id)) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const expenseId = generateId('expense');
    const expense = {
      id: expenseId,
      villaId,
      title,
      amount,
      category: category || 'general',
      description: description || '',
      taskIds: taskIds || [],
      createdBy: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      approvedAt: null,
      paidAt: null
    };
    
    await kv.set(`expense:${expenseId}`, expense);
    await kv.set(`villa:${villaId}:expense:${expenseId}`, expenseId);
    
    return c.json({ success: true, expense });
  } catch (error) {
    console.log('Error creating expense:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get expenses for villa
app.get("/make-server-41a1615d/villas/:id/expenses", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.param('id');
    const villa = await kv.get(`villa:${villaId}`);
    
    if (!villa || !villa.users.some((u: any) => u.userId === user.id)) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const expenseKeys = await kv.getByPrefix(`villa:${villaId}:expense:`);
    const expenseIds = expenseKeys.map((k: any) => `expense:${k.value}`);
    const expenses = await kv.mget(expenseIds);
    
    return c.json({ expenses: expenses.filter(Boolean) });
  } catch (error) {
    console.log('Error fetching expenses:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all expenses for user (across all villas)
app.get("/make-server-41a1615d/expenses", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile || !profile.villas || profile.villas.length === 0) {
      return c.json({ expenses: [] });
    }
    
    let allExpenses: any[] = [];
    
    for (const villaRef of profile.villas) {
      const expenseKeys = await kv.getByPrefix(`villa:${villaRef.villaId}:expense:`);
      const expenseIds = expenseKeys.map((k: any) => `expense:${k.value}`);
      const expenses = await kv.mget(expenseIds);
      allExpenses = allExpenses.concat(expenses.filter(Boolean));
    }
    
    return c.json({ expenses: allExpenses });
  } catch (error) {
    console.log('Error fetching all expenses:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update expense (general update)
app.put("/make-server-41a1615d/expenses/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const expenseId = c.req.param('id');
    const updates = await c.req.json();
    const expense = await kv.get(`expense:${expenseId}`);
    
    if (!expense) {
      return c.json({ error: 'Expense not found' }, 404);
    }
    
    const updatedExpense = {
      ...expense,
      ...updates,
      id: expense.id, // Don't allow ID change
      villaId: expense.villaId, // Don't allow villa change
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`expense:${expenseId}`, updatedExpense);
    
    return c.json({ success: true, expense: updatedExpense });
  } catch (error) {
    console.log('Error updating expense:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update expense status
app.put("/make-server-41a1615d/expenses/:id/status", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));

  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const expenseId = c.req.param('id');
    const { status } = await c.req.json();
    const expense = await kv.get(`expense:${expenseId}`);
    
    if (!expense) {
      return c.json({ error: 'Expense not found' }, 404);
    }
    
    expense.status = status;
    if (status === 'approved') {
      expense.approvedAt = new Date().toISOString();
      expense.approvedBy = user.id;
    } else if (status === 'paid') {
      expense.paidAt = new Date().toISOString();
      expense.paidBy = user.id;
    }
    
    await kv.set(`expense:${expenseId}`, expense);

    return c.json({ success: true, expense });
  } catch (error) {
    console.log('Error updating expense status:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== NOTIFICATION ENDPOINTS ==========

app.get("/make-server-41a1615d/notifications", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));

  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const profile = await kv.get(`user:${user.id}`);

    if (!profile || !profile.villas || profile.villas.length === 0) {
      return c.json({ notifications: [] });
    }

    const notifications: any[] = [];
    const now = new Date();
    const dueSoonThreshold = now.getTime() + 48 * 60 * 60 * 1000; // 48 hours
    const newlyAssignedThreshold = now.getTime() - 48 * 60 * 60 * 1000; // last 48 hours
    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    for (const villaRef of profile.villas) {
      const villa = await kv.get(`villa:${villaRef.villaId}`);
      if (!villa) continue;

      const villaName = villa.name || 'Villa';

      const taskKeys = await kv.getByPrefix(`villa:${villaRef.villaId}:task:`);
      const taskIds = taskKeys.map((entry: any) => `task:${entry.value ?? entry}`);
      const tasks = await kv.mget(taskIds);

      for (const task of tasks.filter(Boolean)) {
        const dueDate = task?.dueDate ? new Date(task.dueDate) : null;
        const createdAt = task?.createdAt ? new Date(task.createdAt) : null;
        const updatedAt = task?.updatedAt ? new Date(task.updatedAt) : null;
        if (!task || task.status === 'completed') {
          continue;
        }

        if (dueDate && dueDate.getTime() < now.getTime()) {
          notifications.push({
            id: `task:${task.id}:overdue`,
            type: 'task',
            title: 'Task overdue',
            message: `"${task.title}" is overdue in ${villaName}.`,
            severity: 'critical',
            createdAt: task.updatedAt || task.createdAt || new Date().toISOString(),
            villaName,
          });
        } else if (dueDate && dueDate.getTime() <= dueSoonThreshold) {
          notifications.push({
            id: `task:${task.id}:due-soon`,
            type: 'task',
            title: 'Task due soon',
            message: `"${task.title}" is due by ${dueDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}.`,
            severity: 'warning',
            createdAt: task.updatedAt || task.createdAt || new Date().toISOString(),
            villaName,
          });
        } else if (
          (createdAt && createdAt.getTime() >= newlyAssignedThreshold) ||
          (updatedAt && updatedAt.getTime() >= newlyAssignedThreshold)
        ) {
          notifications.push({
            id: `task:${task.id}:update`,
            type: 'task',
            title: 'Task assigned',
            message: `New task "${task.title}" assigned in ${villaName}.`,
            severity: 'info',
            createdAt: task.createdAt || new Date().toISOString(),
            villaName,
          });
        }
      }

      const expenseKeys = await kv.getByPrefix(`villa:${villaRef.villaId}:expense:`);
      const expenseIds = expenseKeys.map((entry: any) => `expense:${entry.value ?? entry}`);
      const expenses = await kv.mget(expenseIds);

      for (const expense of expenses.filter(Boolean)) {
        if (!expense || expense.status !== 'pending') continue;

        notifications.push({
          id: `expense:${expense.id}:pending`,
          type: 'expense',
          title: 'Expense awaiting approval',
          message: `${currencyFormatter.format(expense.amount || 0)} "${expense.title}" requires approval for ${villaName}.`,
          severity: 'info',
          createdAt: expense.createdAt || new Date().toISOString(),
          villaName,
        });
      }
    }

    notifications.sort(
      (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime(),
    );

    return c.json({ notifications });
  } catch (error) {
    console.log('Error building notifications:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== CALENDAR ENDPOINTS ==========

// Create calendar event
app.post("/make-server-41a1615d/events", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { villaId, title, description, startDate, endDate, type, taskIds, expenseIds } = await c.req.json();
    
    if (!title || !startDate) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const eventId = generateId('event');
    const event = {
      id: eventId,
      villaId: villaId || null, // If null, it's a personal event
      title,
      description: description || '',
      startDate,
      endDate: endDate || startDate,
      type: type || 'event',
      taskIds: taskIds || [],
      expenseIds: expenseIds || [],
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`event:${eventId}`, event);
    
    if (villaId) {
      await kv.set(`villa:${villaId}:event:${eventId}`, eventId);
    } else {
      await kv.set(`user:${user.id}:event:${eventId}`, eventId);
    }
    
    return c.json({ success: true, event });
  } catch (error) {
    console.log('Error creating event:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get events
app.get("/make-server-41a1615d/events", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.query('villaId');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const type = c.req.query('type');
    const includeAll = c.req.query('includeAll') === 'true'; // Include both personal and villa events
    
    let events = [];
    
    if (villaId) {
      // Get villa events
      const villa = await kv.get(`villa:${villaId}`);
      if (!villa || !villa.users.some((u: any) => u.userId === user.id)) {
        return c.json({ error: 'Access denied' }, 403);
      }
      
      const eventKeys = await kv.getByPrefix(`villa:${villaId}:event:`);
      const eventIds = eventKeys.map((k: any) => `event:${k.value}`);
      events = await kv.mget(eventIds);
    } else if (includeAll) {
      // Get all events (personal + all villas)
      const profile = await kv.get(`user:${user.id}`);
      const userVillas = profile?.villas || [];
      
      // Personal events
      const personalKeys = await kv.getByPrefix(`user:${user.id}:event:`);
      const personalIds = personalKeys.map((k: any) => `event:${k.value}`);
      const personalEvents = await kv.mget(personalIds);
      
      // Villa events
      let villaEvents: any[] = [];
      for (const villaId of userVillas) {
        const villaEventKeys = await kv.getByPrefix(`villa:${villaId}:event:`);
        const villaEventIds = villaEventKeys.map((k: any) => `event:${k.value}`);
        const vEvents = await kv.mget(villaEventIds);
        villaEvents = [...villaEvents, ...vEvents.filter(Boolean)];
      }
      
      events = [...personalEvents.filter(Boolean), ...villaEvents];
    } else {
      // Get personal events only
      const eventKeys = await kv.getByPrefix(`user:${user.id}:event:`);
      const eventIds = eventKeys.map((k: any) => `event:${k.value}`);
      events = await kv.mget(eventIds);
    }
    
    // Filter by date range
    events = events.filter(Boolean);
    if (startDate || endDate) {
      events = events.filter((e: any) => {
        if (startDate && e.endDate < startDate) return false;
        if (endDate && e.startDate > endDate) return false;
        return true;
      });
    }
    
    // Filter by type
    if (type) {
      events = events.filter((e: any) => e.type === type);
    }
    
    // Sort by start date
    events.sort((a: any, b: any) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    return c.json({ events });
  } catch (error) {
    console.log('Error fetching events:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update event
app.put("/make-server-41a1615d/events/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }
    
    // Check permission
    if (event.createdBy !== user.id) {
      return c.json({ error: 'Permission denied' }, 403);
    }
    
    const { title, description, startDate, endDate, type } = await c.req.json();
    
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (type) event.type = type;
    
    event.updatedAt = new Date().toISOString();
    
    await kv.set(`event:${eventId}`, event);
    
    return c.json({ success: true, event });
  } catch (error) {
    console.log('Error updating event:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete event
app.delete("/make-server-41a1615d/events/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }
    
    // Check permission
    if (event.createdBy !== user.id) {
      return c.json({ error: 'Permission denied' }, 403);
    }
    
    // Delete the event
    await kv.del(`event:${eventId}`);
    
    // Delete references
    if (event.villaId) {
      await kv.del(`villa:${event.villaId}:event:${eventId}`);
    } else {
      await kv.del(`user:${user.id}:event:${eventId}`);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting event:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== STAFF MANAGEMENT ENDPOINTS ==========

// Get all staff for user's villas
app.get("/make-server-41a1615d/staff", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile || !profile.villas || profile.villas.length === 0) {
      return c.json({ staff: [] });
    }
    
    let allStaff: any[] = [];
    
    for (const villaRef of profile.villas) {
      const villa = await kv.get(`villa:${villaRef.villaId}`);
      if (villa && villa.users) {
        const staffUsers = villa.users.filter((u: any) => u.role === 'staff');
        
        for (const staffUser of staffUsers) {
          const userProfile = await kv.get(`user:${staffUser.userId}`);
          if (userProfile) {
            allStaff.push({
              id: staffUser.userId,
              name: userProfile.name,
              email: userProfile.email,
              role: staffUser.role,
              villaId: villa.id,
              villaName: villa.name,
              status: 'active',
              joinedAt: staffUser.joinedAt
            });
          }
        }
      }
    }
    
    return c.json({ staff: allStaff });
  } catch (error) {
    console.log('Error fetching all staff:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get staff for specific villa
app.get("/make-server-41a1615d/villas/:id/staff", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.param('id');
    const villa = await kv.get(`villa:${villaId}`);
    
    if (!villa || !villa.users.some((u: any) => u.userId === user.id)) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const staffUsers = villa.users.filter((u: any) => u.role === 'staff');
    const staff = [];
    
    for (const staffUser of staffUsers) {
      const userProfile = await kv.get(`user:${staffUser.userId}`);
      if (userProfile) {
        staff.push({
          id: staffUser.userId,
          name: userProfile.name,
          email: userProfile.email,
          role: staffUser.role,
          status: 'active',
          joinedAt: staffUser.joinedAt
        });
      }
    }
    
    return c.json({ staff });
  } catch (error) {
    console.log('Error fetching villa staff:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Link staff to villa with employment details
app.post("/make-server-41a1615d/staff/link", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { villaId, staffUserId, employerId, managerId, supervisorId, contractDetails } = await c.req.json();
    
    const villa = await kv.get(`villa:${villaId}`);
    if (!villa) {
      return c.json({ error: 'Villa not found' }, 404);
    }
    
    // Check if user is admin
    const userRole = villa.users.find((u: any) => u.userId === user.id);
    if (!userRole || userRole.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const staffId = generateId('staff');
    const staffLink = {
      id: staffId,
      villaId,
      staffUserId,
      employerId,
      managerId,
      supervisorId: supervisorId || null,
      contractDetails: contractDetails || {},
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    await kv.set(`staff:${staffId}`, staffLink);
    await kv.set(`villa:${villaId}:staff:${staffUserId}`, staffId);
    
    return c.json({ success: true, staffLink });
  } catch (error) {
    console.log('Error linking staff:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Clock in/out
app.post("/make-server-41a1615d/staff/clock", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { villaId, action, location } = await c.req.json();
    
    if (!action || !['in', 'out'].includes(action)) {
      return c.json({ error: 'Action must be "in" or "out"' }, 400);
    }
    
    const clockId = generateId('clock');
    const clockRecord = {
      id: clockId,
      villaId,
      userId: user.id,
      action, // 'in' or 'out'
      timestamp: new Date().toISOString(),
      location: location || null,
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };
    
    await kv.set(`clock:${clockId}`, clockRecord);
    await kv.set(`villa:${villaId}:clock:${clockId}`, clockId);
    await kv.set(`user:${user.id}:clock:${clockId}`, clockId);
    
    // Update staff status
    const staffKeys = await kv.getByPrefix(`villa:${villaId}:staff:`);
    for (const key of staffKeys) {
      const staffId = key.value;
      const staff = await kv.get(`staff:${staffId}`);
      if (staff && staff.userId === user.id) {
        staff.status = action === 'in' ? 'clocked_in' : 'active';
        staff.lastClockAction = clockRecord;
        await kv.set(`staff:${staffId}`, staff);
        break;
      }
    }
    
    return c.json({ success: true, clockRecord });
  } catch (error) {
    console.log('Error recording clock in/out:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get clock records for user
app.get("/make-server-41a1615d/staff/clock", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.query('villaId');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    
    const clockKeys = await kv.getByPrefix(`user:${user.id}:clock:`);
    const clockIds = clockKeys.map((k: any) => `clock:${k.value}`);
    let clockRecords = await kv.mget(clockIds);
    
    // Filter by villa if provided
    if (villaId) {
      clockRecords = clockRecords.filter((r: any) => r && r.villaId === villaId);
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      clockRecords = clockRecords.filter((r: any) => {
        if (!r) return false;
        const recordDate = r.timestamp.split('T')[0];
        if (startDate && recordDate < startDate) return false;
        if (endDate && recordDate > endDate) return false;
        return true;
      });
    }
    
    // Sort by timestamp descending
    clockRecords = clockRecords.filter(Boolean).sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return c.json({ clockRecords });
  } catch (error) {
    console.log('Error fetching clock records:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get current clock status
app.get("/make-server-41a1615d/staff/clock/status", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.query('villaId');
    
    if (!villaId) {
      return c.json({ error: 'Villa ID required' }, 400);
    }
    
    // Get today's records
    const today = new Date().toISOString().split('T')[0];
    const clockKeys = await kv.getByPrefix(`user:${user.id}:clock:`);
    const clockIds = clockKeys.map((k: any) => `clock:${k.value}`);
    let clockRecords = await kv.mget(clockIds);
    
    // Filter by villa and today
    clockRecords = clockRecords.filter((r: any) => 
      r && r.villaId === villaId && r.date === today
    );
    
    // Sort by timestamp
    clockRecords.sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const lastRecord = clockRecords[clockRecords.length - 1];
    const isClockedIn = lastRecord && lastRecord.action === 'in';
    
    // Calculate hours worked today
    let hoursWorked = 0;
    for (let i = 0; i < clockRecords.length; i += 2) {
      const clockIn = clockRecords[i];
      const clockOut = clockRecords[i + 1];
      
      if (clockIn && clockIn.action === 'in') {
        const inTime = new Date(clockIn.timestamp).getTime();
        const outTime = clockOut && clockOut.action === 'out' 
          ? new Date(clockOut.timestamp).getTime()
          : Date.now();
        
        hoursWorked += (outTime - inTime) / (1000 * 60 * 60);
      }
    }
    
    return c.json({ 
      isClockedIn,
      lastRecord,
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      todayRecords: clockRecords
    });
  } catch (error) {
    console.log('Error getting clock status:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Create leave request
app.post("/make-server-41a1615d/staff/leave", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { villaId, startDate, endDate, reason, type } = await c.req.json();
    
    if (!startDate || !endDate) {
      return c.json({ error: 'Start date and end date are required' }, 400);
    }
    
    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const leaveId = generateId('leave');
    const leaveRequest = {
      id: leaveId,
      villaId,
      userId: user.id,
      startDate,
      endDate,
      days,
      reason: reason || '',
      type: type || 'vacation',
      status: 'pending',
      createdAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null
    };
    
    await kv.set(`leave:${leaveId}`, leaveRequest);
    await kv.set(`villa:${villaId}:leave:${leaveId}`, leaveId);
    await kv.set(`user:${user.id}:leave:${leaveId}`, leaveId);
    
    return c.json({ success: true, leaveRequest });
  } catch (error) {
    console.log('Error creating leave request:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get leave requests for villa
app.get("/make-server-41a1615d/villas/:id/leave", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.param('id');
    const villa = await kv.get(`villa:${villaId}`);
    
    if (!villa || !villa.users.some((u: any) => u.userId === user.id)) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const leaveKeys = await kv.getByPrefix(`villa:${villaId}:leave:`);
    const leaveIds = leaveKeys.map((k: any) => `leave:${k.value}`);
    const leaves = await kv.mget(leaveIds);
    
    return c.json({ leaves: leaves.filter(Boolean) });
  } catch (error) {
    console.log('Error fetching leave requests:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update leave status
app.put("/make-server-41a1615d/staff/leave/:id/status", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const leaveId = c.req.param('id');
    const { status, rejectionReason } = await c.req.json();
    const leave = await kv.get(`leave:${leaveId}`);
    
    if (!leave) {
      return c.json({ error: 'Leave request not found' }, 404);
    }
    
    leave.status = status;
    if (status === 'approved') {
      leave.approvedAt = new Date().toISOString();
      leave.approvedBy = user.id;
    } else if (status === 'rejected') {
      leave.rejectedAt = new Date().toISOString();
      leave.rejectedBy = user.id;
      leave.rejectionReason = rejectionReason || '';
    }
    
    await kv.set(`leave:${leaveId}`, leave);
    
    return c.json({ success: true, leave });
  } catch (error) {
    console.log('Error updating leave status:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get user's leave requests
app.get("/make-server-41a1615d/staff/leave", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const status = c.req.query('status');
    const villaId = c.req.query('villaId');
    
    const leaveKeys = await kv.getByPrefix(`user:${user.id}:leave:`);
    const leaveIds = leaveKeys.map((k: any) => `leave:${k.value}`);
    let leaves = await kv.mget(leaveIds);
    
    // Filter by status if provided
    if (status) {
      leaves = leaves.filter((l: any) => l && l.status === status);
    }
    
    // Filter by villa if provided
    if (villaId) {
      leaves = leaves.filter((l: any) => l && l.villaId === villaId);
    }
    
    // Sort by creation date descending
    leaves = leaves.filter(Boolean).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ leaves });
  } catch (error) {
    console.log('Error fetching leave requests:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Cancel leave request (only pending ones)
app.delete("/make-server-41a1615d/staff/leave/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const leaveId = c.req.param('id');
    const leave = await kv.get(`leave:${leaveId}`);
    
    if (!leave) {
      return c.json({ error: 'Leave request not found' }, 404);
    }
    
    if (leave.userId !== user.id) {
      return c.json({ error: 'Permission denied' }, 403);
    }
    
    if (leave.status !== 'pending') {
      return c.json({ error: 'Can only cancel pending requests' }, 400);
    }
    
    // Update status to cancelled instead of deleting
    leave.status = 'cancelled';
    leave.cancelledAt = new Date().toISOString();
    
    await kv.set(`leave:${leaveId}`, leave);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error cancelling leave request:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== EXPENSE TEMPLATE ENDPOINTS ==========

// Create expense template
app.post("/make-server-41a1615d/expense-templates", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { name, category, amount, description, villaId } = await c.req.json();
    
    if (!name || !category) {
      return c.json({ error: 'Name and category are required' }, 400);
    }
    
    const templateId = generateId('template');
    const template = {
      id: templateId,
      userId: user.id,
      villaId: villaId || null,
      name,
      category,
      amount: amount || null,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    };
    
    await kv.set(`template:${templateId}`, template);
    await kv.set(`user:${user.id}:template:${templateId}`, templateId);
    
    if (villaId) {
      await kv.set(`villa:${villaId}:template:${templateId}`, templateId);
    }
    
    return c.json({ success: true, template });
  } catch (error) {
    console.log('Error creating expense template:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get user's expense templates
app.get("/make-server-41a1615d/expense-templates", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.query('villaId');
    
    let templateKeys;
    if (villaId) {
      // Get templates for specific villa
      templateKeys = await kv.getByPrefix(`villa:${villaId}:template:`);
    } else {
      // Get all user's templates
      templateKeys = await kv.getByPrefix(`user:${user.id}:template:`);
    }
    
    const templateIds = templateKeys.map((k: any) => `template:${k.value}`);
    const templates = await kv.mget(templateIds);
    
    return c.json({ templates: templates.filter(Boolean) });
  } catch (error) {
    console.log('Error fetching expense templates:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update expense template
app.put("/make-server-41a1615d/expense-templates/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const templateId = c.req.param('id');
    const template = await kv.get(`template:${templateId}`);
    
    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    if (template.userId !== user.id) {
      return c.json({ error: 'Permission denied' }, 403);
    }
    
    const { name, category, amount, description } = await c.req.json();
    
    const updatedTemplate = {
      ...template,
      name: name || template.name,
      category: category || template.category,
      amount: amount !== undefined ? amount : template.amount,
      description: description !== undefined ? description : template.description,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`template:${templateId}`, updatedTemplate);
    
    return c.json({ success: true, template: updatedTemplate });
  } catch (error) {
    console.log('Error updating expense template:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete expense template
app.delete("/make-server-41a1615d/expense-templates/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const templateId = c.req.param('id');
    const template = await kv.get(`template:${templateId}`);
    
    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    if (template.userId !== user.id) {
      return c.json({ error: 'Permission denied' }, 403);
    }
    
    await kv.del(`template:${templateId}`);
    await kv.del(`user:${user.id}:template:${templateId}`);
    
    if (template.villaId) {
      await kv.del(`villa:${template.villaId}:template:${templateId}`);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting expense template:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Increment template usage count
app.post("/make-server-41a1615d/expense-templates/:id/use", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const templateId = c.req.param('id');
    const template = await kv.get(`template:${templateId}`);
    
    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    if (template.userId !== user.id) {
      return c.json({ error: 'Permission denied' }, 403);
    }
    
    const updatedTemplate = {
      ...template,
      usageCount: (template.usageCount || 0) + 1,
      lastUsedAt: new Date().toISOString()
    };
    
    await kv.set(`template:${templateId}`, updatedTemplate);
    
    return c.json({ success: true, template: updatedTemplate });
  } catch (error) {
    console.log('Error incrementing template usage:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== FILE STORAGE ENDPOINTS ==========

// Initialize storage buckets on startup
const initializeStorage = async () => {
  try {
    const supabase = createServiceRoleClient();
    
    const bucketName = 'make-41a1615d-receipts';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      });
      console.log('Created receipts bucket');
    }
  } catch (error) {
    console.log('Error initializing storage:', error);
  }
};

// Initialize storage on startup
initializeStorage();

// Upload file
app.post("/make-server-41a1615d/upload", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const expenseId = formData.get('expenseId') as string;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Validate file size (5MB max)
    if (file.size > 5242880) {
      return c.json({ error: 'File size exceeds 5MB limit' }, 400);
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPG, PNG, and PDF allowed' }, 400);
    }
    
    const supabase = createServiceRoleClient();
    
    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('make-41a1615d-receipts')
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false
      });
    
    if (uploadError) {
      console.log('Upload error:', uploadError);
      return c.json({ error: uploadError.message }, 500);
    }
    
    // Generate signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from('make-41a1615d-receipts')
      .createSignedUrl(fileName, 31536000); // 1 year
    
    const fileRecord = {
      id: generateId('file'),
      userId: user.id,
      expenseId: expenseId || null,
      fileName: file.name,
      storagePath: fileName,
      fileType: file.type,
      fileSize: file.size,
      signedUrl: urlData?.signedUrl || null,
      uploadedAt: new Date().toISOString()
    };
    
    // Store file metadata
    await kv.set(`file:${fileRecord.id}`, fileRecord);
    
    if (expenseId) {
      await kv.set(`expense:${expenseId}:file:${fileRecord.id}`, fileRecord.id);
    }
    
    return c.json({ success: true, file: fileRecord });
  } catch (error) {
    console.log('Error uploading file:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get files for expense
app.get("/make-server-41a1615d/expenses/:id/files", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const expenseId = c.req.param('id');
    const expense = await kv.get(`expense:${expenseId}`);
    
    if (!expense) {
      return c.json({ error: 'Expense not found' }, 404);
    }
    
    const fileKeys = await kv.getByPrefix(`expense:${expenseId}:file:`);
    const fileIds = fileKeys.map((k: any) => `file:${k.value}`);
    const files = await kv.mget(fileIds);
    
    return c.json({ files: files.filter(Boolean) });
  } catch (error) {
    console.log('Error fetching expense files:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete file
app.delete("/make-server-41a1615d/files/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const fileId = c.req.param('id');
    const file = await kv.get(`file:${fileId}`);
    
    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }
    
    // Only file owner can delete
    if (file.userId !== user.id) {
      return c.json({ error: 'Permission denied' }, 403);
    }
    
    const supabase = createServiceRoleClient();
    
    // Delete from storage
    await supabase.storage
      .from('make-41a1615d-receipts')
      .remove([file.storagePath]);
    
    // Delete metadata
    await kv.del(`file:${fileId}`);
    
    if (file.expenseId) {
      await kv.del(`expense:${file.expenseId}:file:${fileId}`);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting file:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== MESSAGING ENDPOINTS ==========

// Create chat
app.post("/make-server-41a1615d/chats", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { villaId, subject, participants } = await c.req.json();
    
    if (!villaId || !subject || !participants || participants.length === 0) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const villa = await kv.get(`villa:${villaId}`);
    if (!villa || !villa.users.some((u: any) => u.userId === user.id)) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    // Verify all participants have access to villa
    const allHaveAccess = participants.every((p: string) =>
      villa.users.some((u: any) => u.userId === p)
    );
    
    if (!allHaveAccess) {
      return c.json({ error: 'All participants must have access to villa' }, 400);
    }
    
    const chatId = generateId('chat');
    const chat = {
      id: chatId,
      villaId,
      subject,
      participants: [...participants, user.id],
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`chat:${chatId}`, chat);
    await kv.set(`villa:${villaId}:chat:${chatId}`, chatId);
    
    return c.json({ success: true, chat });
  } catch (error) {
    console.log('Error creating chat:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get chats for villa
app.get("/make-server-41a1615d/villas/:id/chats", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const villaId = c.req.param('id');
    const villa = await kv.get(`villa:${villaId}`);
    
    if (!villa || !villa.users.some((u: any) => u.userId === user.id)) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const chatKeys = await kv.getByPrefix(`villa:${villaId}:chat:`);
    const chatIds = chatKeys.map((k: any) => `chat:${k.value}`);
    const chats = await kv.mget(chatIds);
    
    // Filter to only chats user is participant in
    const userChats = chats.filter((chat: any) => 
      chat && chat.participants.includes(user.id)
    );
    
    return c.json({ chats: userChats });
  } catch (error) {
    console.log('Error fetching chats:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Send message
app.post("/make-server-41a1615d/chats/:id/messages", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const chatId = c.req.param('id');
    const { content } = await c.req.json();
    const chat = await kv.get(`chat:${chatId}`);
    
    if (!chat) {
      return c.json({ error: 'Chat not found' }, 404);
    }
    
    if (!chat.participants.includes(user.id)) {
      return c.json({ error: 'Not a participant of this chat' }, 403);
    }
    
    const messageId = generateId('message');
    const message = {
      id: messageId,
      chatId,
      senderId: user.id,
      content,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`message:${messageId}`, message);
    await kv.set(`chat:${chatId}:message:${messageId}`, messageId);
    
    // Update chat with last message info
    chat.lastMessage = content;
    chat.lastMessageAt = message.createdAt;
    chat.lastMessageBy = user.id;
    await kv.set(`chat:${chatId}`, chat);
    
    return c.json({ success: true, message });
  } catch (error) {
    console.log('Error sending message:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get messages for chat
app.get("/make-server-41a1615d/chats/:id/messages", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const chatId = c.req.param('id');
    const chat = await kv.get(`chat:${chatId}`);
    
    if (!chat) {
      return c.json({ error: 'Chat not found' }, 404);
    }
    
    if (!chat.participants.includes(user.id)) {
      return c.json({ error: 'Not a participant of this chat' }, 403);
    }
    
    const messageKeys = await kv.getByPrefix(`chat:${chatId}:message:`);
    const messageIds = messageKeys.map((k: any) => `message:${k.value}`);
    const messages = await kv.mget(messageIds);
    
    // Sort by creation time
    const sortedMessages = messages.filter(Boolean).sort((a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return c.json({ messages: sortedMessages });
  } catch (error) {
    console.log('Error fetching messages:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all chats for user across all villas
app.get("/make-server-41a1615d/chats", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    const userVillas = profile?.villas || [];
    
    let allChats: any[] = [];
    
    // Get chats from all user's villas
    for (const villaId of userVillas) {
      const chatKeys = await kv.getByPrefix(`villa:${villaId}:chat:`);
      const chatIds = chatKeys.map((k: any) => `chat:${k.value}`);
      const villaChats = await kv.mget(chatIds);
      
      // Filter to only chats user is participant in
      const userChats = villaChats.filter((chat: any) => 
        chat && chat.participants.includes(user.id)
      );
      
      allChats = [...allChats, ...userChats];
    }
    
    // Sort by last message time (most recent first)
    allChats.sort((a: any, b: any) => {
      const aTime = a.lastMessageAt || a.createdAt;
      const bTime = b.lastMessageAt || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
    
    return c.json({ chats: allChats });
  } catch (error) {
    console.log('Error fetching chats:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get user profile by ID
app.get("/make-server-41a1615d/users/:id", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const userId = c.req.param('id');
    const profile = await kv.get(`user:${userId}`);
    
    if (!profile) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Only return basic info for security
    return c.json({
      id: profile.id,
      email: profile.email,
      name: profile.name || profile.email,
    });
  } catch (error) {
    console.log('Error fetching user:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get current user info
app.get("/make-server-41a1615d/users/me", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        ...profile,
      },
    });
  } catch (error) {
    console.log('Error fetching current user:', error);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);