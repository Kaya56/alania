import { useState } from 'react';

export function useSettings() {
  const [messageStatusMode] = useState('ticks'); // Par défaut
  return { messageStatusMode };
}