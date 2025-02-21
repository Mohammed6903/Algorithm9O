"use client"
import SideNav from '@/components/ui/dashboard/sidenav';
import { useState } from 'react';
import clsx from 'clsx';
import '../../globals.css';

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
     
        <div className="flex h-screen flex-col md:flex-row overflow-hidden">
          <div 
            className={clsx(
              "flex-none transition-all duration-300",
              isExpanded ? "md:w-64" : "md:w-16"
            )}
          >
            <SideNav 
              userType={'student'} 
              isExpanded={isExpanded} 
              setIsExpanded={setIsExpanded}
            />
          </div>
          <div className="flex-grow overflow-hidden hover:overflow-y-auto">
            {children}
          </div>
        </div>
  );
}