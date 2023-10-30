import { useState } from 'react';

// Hook to show popup Auth Modal when user isn't logged in yet. Reusable.
// See example usage in AddIdea.tsx
//  MAKE SURE TO ALWAYS NEST AUTH MODAL CLEARLY WITHIN
// THE PARENT DIALOG PANEL TO AVOID WEIRD ISSUES WITH
// NESTED OVERLAYS
export default function useAuthModal(auth: any) {
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  function checkAuth() {
    if (!auth.user) {
      setShowAuthModal(true);
      return false;
    }
    setShowAuthModal(false);
    return true;
  }

  return { showAuthModal, setShowAuthModal, checkAuth };
}
