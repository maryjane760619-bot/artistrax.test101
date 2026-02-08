'use client';

import { usePathname } from 'next/navigation';
import { AIChatWidget } from './ai-chat-widget';

export function AIChatWrapper() {
  const pathname = usePathname();

  // Detect user type from URL path
  let userType: 'fan' | 'artist' | 'label' | undefined;
  
  if (pathname?.startsWith('/fan')) {
    userType = 'fan';
  } else if (pathname?.startsWith('/artist')) {
    userType = 'artist';
  } else if (pathname?.startsWith('/label')) {
    userType = 'label';
  }

  return <AIChatWidget userType={userType} />;
}
