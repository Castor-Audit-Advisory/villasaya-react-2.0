import { supabase } from './supabase-client';
import { AuthSession, User } from '../types';

class AuthManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private refreshPromise: Promise<AuthSession | null> | null = null;

  /**
   * Check if the current session is expired
   */
  isSessionExpired(): boolean {
    try {
      const expiresAt = sessionStorage.getItem('expires_at');
      if (!expiresAt) return true;
      
      const expiryTime = parseInt(expiresAt);
      const now = Date.now();
      // Consider expired if less than 5 minutes remaining
      return now >= (expiryTime - 5 * 60 * 1000);
    } catch (error) {
      // Storage unavailable - consider session expired
      return true;
    }
  }

  /**
   * Get the current access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const accessToken = sessionStorage.getItem('access_token');
      
      if (!accessToken) {
        return null;
      }

      // Check if this is a custom backend token (not Supabase)
      // Custom backend tokens don't need Supabase refresh
      const isCustomBackendAuth = sessionStorage.getItem('user_id') && !sessionStorage.getItem('refresh_token');
      
      if (isCustomBackendAuth) {
        // For custom backend, check if token is expired
        if (this.isSessionExpired()) {
          // Token expired - user needs to sign in again
          this.clearSession();
          return null;
        }
        return accessToken;
      }

      // For Supabase auth, handle token refresh
      if (this.isSessionExpired()) {
        const session = await this.refreshSession();
        return session?.access_token || null;
      }

      return accessToken;
    } catch (error) {
      // For Supabase auth, try to refresh session
      const isCustomBackendAuth = sessionStorage.getItem('user_id') && !sessionStorage.getItem('refresh_token');
      if (!isCustomBackendAuth) {
        const session = await this.refreshSession();
        return session?.access_token || null;
      }
      return null;
    }
  }

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<AuthSession | null> {
    // If already refreshing, wait for that to complete
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    
    return result;
  }

  private async _performRefresh(): Promise<AuthSession | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        this.clearSession();
        // Dispatch event for session refresh failure
        window.dispatchEvent(new CustomEvent('auth:refresh-failed', { 
          detail: { error: error?.message || 'Session refresh failed' } 
        }));
        return null;
      }

      const session: AuthSession = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.name || '',
          role: data.session.user.user_metadata?.role || 'tenant',
          createdAt: data.session.user.created_at
        }
      };

      this.saveSession(session);
      this.setupAutoRefresh(session.expires_at);
      
      return session;
    } catch (error) {
      this.clearSession();
      // Dispatch event for unexpected errors
      window.dispatchEvent(new CustomEvent('auth:error', { 
        detail: { error: error instanceof Error ? error.message : 'Authentication error occurred' } 
      }));
      return null;
    }
  }

  /**
   * Save session data to storage
   */
  saveSession(session: AuthSession) {
    try {
      sessionStorage.setItem('access_token', session.access_token);
      sessionStorage.setItem('user_id', session.user.id);
      
      if (session.refresh_token) {
        sessionStorage.setItem('refresh_token', session.refresh_token);
      }
      
      if (session.expires_at) {
        sessionStorage.setItem('expires_at', String(session.expires_at * 1000));
      }

      // Also store user data
      sessionStorage.setItem('user_data', JSON.stringify(session.user));
    } catch (error) {
      // Storage unavailable - session will only persist in memory
      // This can happen in private browsing mode or when quota is exceeded
    }
  }

  /**
   * Clear all session data
   */
  clearSession() {
    try {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('expires_at');
      sessionStorage.removeItem('user_id');
      sessionStorage.removeItem('user_data');
    } catch (error) {
      // Storage unavailable - session data will be lost on page reload anyway
    }
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Setup automatic token refresh before expiry
   */
  setupAutoRefresh(expiresAt?: number) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!expiresAt) return;

    const expiryTime = expiresAt * 1000;
    const now = Date.now();
    // Refresh 10 minutes before expiry
    const refreshTime = expiryTime - now - (10 * 60 * 1000);

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshSession();
      }, refreshTime);
    }
  }

  /**
   * Initialize auth state from existing session
   */
  async initialize(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        // Dispatch event for initialization errors
        window.dispatchEvent(new CustomEvent('auth:init-failed', { 
          detail: { error: error.message || 'Failed to initialize authentication' } 
        }));
        return false;
      }
      
      if (data.session) {
        const session: AuthSession = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          user: {
            id: data.session.user.id,
            email: data.session.user.email!,
            name: data.session.user.user_metadata?.name || '',
            role: data.session.user.user_metadata?.role || 'tenant',
            createdAt: data.session.user.created_at
          }
        };

        this.saveSession(session);
        this.setupAutoRefresh(session.expires_at);
        return true;
      }

      return false;
    } catch (error) {
      // Dispatch event for unexpected errors
      window.dispatchEvent(new CustomEvent('auth:error', { 
        detail: { error: error instanceof Error ? error.message : 'Authentication initialization failed' } 
      }));
      return false;
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser(): User | null {
    const userData = sessionStorage.getItem('user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Handle authentication errors with detailed feedback
   */
  handleAuthError(error: any) {
    // Handle JWT expiration
    if (error?.status === 401 || error?.message?.includes('JWT expired')) {
      this.clearSession();
      window.dispatchEvent(new CustomEvent('auth:expired', {
        detail: { message: 'Your session has expired. Please sign in again.' }
      }));
      return;
    }

    // Handle network errors
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Network')) {
      window.dispatchEvent(new CustomEvent('auth:network-error', {
        detail: { message: 'Network connection lost. Please check your internet connection.' }
      }));
      return;
    }

    // Handle other authentication errors
    window.dispatchEvent(new CustomEvent('auth:error', {
      detail: { 
        message: error?.message || 'An authentication error occurred. Please try again.' 
      }
    }));
  }
}

// Create singleton instance
export const authManager = new AuthManager();

// CSRF Token Management
class CSRFManager {
  private csrfToken: string | null = null;

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    try {
      sessionStorage.setItem('csrf_token', this.csrfToken);
    } catch (error) {
      // Storage unavailable (private mode, quota exceeded, etc.)
      // Token will still work in memory for this session
    }
    
    return this.csrfToken;
  }

  /**
   * Get the current CSRF token
   */
  getToken(): string {
    if (!this.csrfToken) {
      try {
        this.csrfToken = sessionStorage.getItem('csrf_token');
      } catch (error) {
        // Storage unavailable, will generate new token
      }
      
      if (!this.csrfToken) {
        this.csrfToken = this.generateToken();
      }
    }
    return this.csrfToken;
  }

  /**
   * Validate a CSRF token
   */
  validateToken(token: string): boolean {
    return token === this.getToken();
  }

  /**
   * Clear the CSRF token
   */
  clearToken() {
    this.csrfToken = null;
    
    try {
      sessionStorage.removeItem('csrf_token');
    } catch (error) {
      // Storage unavailable, token already cleared from memory
    }
  }
}

export const csrfManager = new CSRFManager();