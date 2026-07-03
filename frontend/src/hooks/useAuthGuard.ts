import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * useAuthGuard — wraps any action with a login check.
 *
 * Usage:
 *   const guard = useAuthGuard();
 *   guard(() => addItem(product, size));   // if not logged in → opens login modal
 *                                          // if logged in → runs the action directly
 */
export const useAuthGuard = () => {
  const { user, openLogin } = useAuth();

  return useCallback(
    (action: () => void) => {
      if (user) {
        action();
      } else {
        openLogin();
      }
    },
    [user, openLogin]
  );
};
