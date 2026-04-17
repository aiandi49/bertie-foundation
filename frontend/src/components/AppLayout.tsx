import React, { createContext, useContext } from 'react';
import { Footer } from './Footer';

interface WidgetContextType {
  hideSupportWidget?: boolean;
}

export const WidgetContext = createContext<WidgetContextType>({});

interface Props {
  children: React.ReactNode;
}

export function AppLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-secondary-950 flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
