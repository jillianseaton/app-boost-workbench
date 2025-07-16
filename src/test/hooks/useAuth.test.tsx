import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/hooks/useAuth';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it('sets user when session exists', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
    };

    const mockSession = {
      user: mockUser,
      access_token: 'token',
    };

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
    });

    const { result } = renderHook(() => useAuth());

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('handles auth state changes', () => {
    let authCallback: (event: string, session: any) => void;

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { user: mockUser };

    // Simulate auth state change
    authCallback!('SIGNED_IN', mockSession);

    expect(result.current.user).toEqual(mockUser);
  });

  it('cleans up subscription on unmount', () => {
    const mockUnsubscribe = vi.fn();
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});