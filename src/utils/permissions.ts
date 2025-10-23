import { User, Villa } from '../types';

// Define permission types
export type Permission = 
  | 'villa.create'
  | 'villa.edit'
  | 'villa.delete'
  | 'villa.invite'
  | 'task.create'
  | 'task.edit'
  | 'task.delete'
  | 'task.assign'
  | 'expense.create'
  | 'expense.edit'
  | 'expense.delete'
  | 'expense.approve'
  | 'expense.view'
  | 'staff.manage'
  | 'staff.view'
  | 'calendar.create'
  | 'calendar.edit'
  | 'calendar.delete'
  | 'calendar.view'
  | 'message.send'
  | 'message.delete'
  | 'reports.view'
  | 'reports.export';

export type UserRole = 'landlord' | 'property_agent' | 'tenant' | 'staff' | 'admin';

// Define permissions for each role
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'villa.create', 'villa.edit', 'villa.delete', 'villa.invite',
    'task.create', 'task.edit', 'task.delete', 'task.assign',
    'expense.create', 'expense.edit', 'expense.delete', 'expense.approve',
    'staff.manage', 'staff.view',
    'calendar.create', 'calendar.edit', 'calendar.delete',
    'message.send', 'message.delete',
    'reports.view', 'reports.export'
  ],
  landlord: [
    'villa.edit', 'villa.invite',
    'task.create', 'task.edit', 'task.assign',
    'expense.approve', 'expense.view',
    'staff.manage', 'staff.view',
    'calendar.create', 'calendar.edit',
    'message.send',
    'reports.view', 'reports.export'
  ],
  property_agent: [
    'villa.edit', 'villa.invite',
    'task.create', 'task.edit', 'task.assign',
    'expense.create', 'expense.edit',
    'staff.view',
    'calendar.create', 'calendar.edit',
    'message.send',
    'reports.view'
  ],
  tenant: [
    'task.create', 'task.edit',
    'expense.create',
    'calendar.create', 'calendar.edit',
    'message.send',
    'reports.view'
  ],
  staff: [
    'task.edit',
    'expense.create',
    'calendar.view',
    'message.send'
  ]
};

// Permission checker class
export class PermissionChecker {
  private userRole: UserRole | null = null;
  private villaRole: UserRole | null = null;
  private permissions: Set<Permission> = new Set();

  constructor(user?: User | null, villa?: Villa | null) {
    if (user && villa) {
      this.initialize(user, villa);
    } else if (user) {
      this.initializeGlobalRole(user);
    }
  }

  private initialize(user: User, villa: Villa): void {
    // Find user's role in the specific villa
    const villaUser = villa.users?.find(u => u.userId === user.id);
    if (villaUser) {
      this.villaRole = villaUser.role as UserRole;
      this.permissions = new Set(rolePermissions[this.villaRole] || []);
    } else {
      // User is not a member of this villa, no permissions granted
      this.permissions = new Set();
      return;
    }
    
    // Only use global role permissions for non-villa-scoped actions
    // when we have a valid villa membership
    if (user.role && villaUser) {
      this.userRole = user.role as UserRole;
      // Only add non-villa-scoped permissions from global role
      const globalPermissions = rolePermissions[this.userRole] || [];
      const nonVillaPermissions = globalPermissions.filter(p => 
        !p.startsWith('villa.') && 
        !p.startsWith('task.') && 
        !p.startsWith('expense.') &&
        !p.startsWith('staff.') &&
        !p.startsWith('calendar.')
      );
      nonVillaPermissions.forEach(p => this.permissions.add(p));
    }
  }

  private initializeGlobalRole(user: User): void {
    if (user.role) {
      this.userRole = user.role as UserRole;
      this.permissions = new Set(rolePermissions[this.userRole] || []);
    }
  }

  // Check if user has a specific permission
  hasPermission(permission: Permission): boolean {
    return this.permissions.has(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(p => this.hasPermission(p));
  }

  // Get user's role
  getRole(): UserRole | null {
    return this.villaRole || this.userRole;
  }

  // Check if user is admin or landlord
  isOwnerOrAdmin(): boolean {
    const role = this.getRole();
    return role === 'admin' || role === 'landlord';
  }

  // Check if user can manage villa
  canManageVilla(): boolean {
    return this.hasAnyPermission(['villa.edit', 'villa.delete', 'villa.invite']);
  }

  // Check if user can manage tasks
  canManageTasks(): boolean {
    return this.hasAnyPermission(['task.create', 'task.edit', 'task.delete', 'task.assign']);
  }

  // Check if user can approve expenses
  canApproveExpenses(): boolean {
    return this.hasPermission('expense.approve');
  }

  // Check if user can manage staff
  canManageStaff(): boolean {
    return this.hasPermission('staff.manage');
  }

  // Get all permissions for the user
  getAllPermissions(): Permission[] {
    return Array.from(this.permissions);
  }
}

// React hook for permissions
import { useEffect, useState } from 'react';
import { useAuth, useVillas } from '../hooks/useAppState';

export function usePermissions(villaId?: string) {
  const { currentUser } = useAuth();
  const { villas } = useVillas();
  const [permissions, setPermissions] = useState<PermissionChecker | null>(null);

  useEffect(() => {
    if (currentUser) {
      const villa = villaId ? villas.find(v => v.id === villaId) : null;
      const checker = new PermissionChecker(currentUser, villa || undefined);
      setPermissions(checker);
    } else {
      setPermissions(null);
    }
  }, [currentUser, villaId, villas]);

  return permissions;
}

// Permission guard component
import React from 'react';

interface PermissionGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  villaId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  villaId,
  children,
  fallback = null
}: PermissionGuardProps) {
  const checker = usePermissions(villaId);

  if (!checker) {
    return React.createElement(React.Fragment, null, fallback);
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = checker.hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? checker.hasAllPermissions(permissions)
      : checker.hasAnyPermission(permissions);
  } else {
    hasAccess = true; // No specific permission required
  }

  return hasAccess ? React.createElement(React.Fragment, null, children) : React.createElement(React.Fragment, null, fallback);
}

// Utility function to check permissions without hook
export function checkPermission(
  user: User | null,
  permission: Permission,
  villa?: Villa | null
): boolean {
  if (!user) return false;
  const checker = new PermissionChecker(user, villa || undefined);
  return checker.hasPermission(permission);
}

// Export a helper to get role display name
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    landlord: 'Landlord',
    property_agent: 'Property Agent',
    tenant: 'Tenant',
    staff: 'Staff'
  };
  return roleNames[role] || role;
}