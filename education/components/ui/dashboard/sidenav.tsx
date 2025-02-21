import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { teacherNavItems, studentNavItems } from '@/lib/data/navdata';
import { Settings, LogOut } from 'lucide-react';
// import AuthButton from '@/components/header-auth';
import { signOutAction } from '@/app/actions/userActions';
import Link from 'next/link';
// import { useRouter } from 'next/router';
import { Button } from '../button';

export default function SideNav({ userType, isExpanded, setIsExpanded } : {
  userType: string,
  isExpanded: boolean,
  setIsExpanded: (a: boolean) => void
  }) {
  const pathname = usePathname();
  const navItems = userType === 'teacher' ? teacherNavItems : studentNavItems;

  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Call the sign out action
      await signOutAction();
      // Redirect to sign-in page
      router.push('/sign-in');
    } catch (error) {
      console.error('Sign out failed:', error);
      // Optionally handle error state here
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white relative">
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-gray-700 px-6">
        <Link 
          href="/dashboard" 
          className={clsx(
            "flex items-center gap-2 font-semibold",
            !isExpanded && "justify-center"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold">D</span>
          </div>
          {isExpanded && <span className="text-xl transition-opacity duration-300">Dashboard</span>}
        </Link>
      </div>

      {/* Navigation Section */}
      <nav className={clsx(
        "flex-1 space-y-1 py-4",
        isExpanded ? "px-3" : "px-2"
      )}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-700',
                {
                  'bg-gray-800 text-white': pathname === item.href,
                  'text-gray-300': pathname !== item.href,
                },
                !isExpanded && "justify-center px-2"
              )}
              title={!isExpanded ? item.name : undefined}
            >
              <IconComponent className={clsx(
                "h-5 w-5 flex-shrink-0",
                isExpanded ? "mr-3" : "mr-0"
              )} />
              {isExpanded && (
                <span className="transition-opacity duration-300">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={clsx(
        "border-t border-gray-700",
        isExpanded ? "p-3" : "p-2"
      )}>
        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className={clsx(
            'group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700',
            {
              'bg-gray-800 text-white': pathname === '/dashboard/settings',
            },
            !isExpanded && "justify-center px-2"
          )}
          title={!isExpanded ? "Settings" : undefined}
        >
          <Settings className={clsx(
            "h-5 w-5",
            isExpanded ? "mr-3" : "mr-0"
          )} />
          {isExpanded && <span>Settings</span>}
        </Link>

        {/* Logout */}
        {/* <Link
          href="/logout"
          className={clsx(
            'group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700',
            {
              'bg-gray-800 text-white': pathname === '/logout',
            },
            !isExpanded && "justify-center px-2"
          )}
          title={!isExpanded ? "Logout" : undefined}
        >
          <LogOut className={clsx(
            "h-5 w-5",
            isExpanded ? "mr-3" : "mr-0"
          )} />
          {isExpanded && <span>Logout</span>}
        </Link> */}
        <button
          onClick={handleSignOut}
          className={clsx(
            'w-full group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700',
            !isExpanded && "justify-center px-2"
          )}
          title={!isExpanded ? "Logout" : undefined}
        >
          <LogOut className={clsx(
            "h-5 w-5",
            isExpanded ? "mr-3" : "mr-0"
          )} />
          {isExpanded && <span>Logout</span>}
        </button>

      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-20 hidden md:block h-6 w-6 rounded-full bg-gray-800 text-white shadow-md hover:bg-gray-700 transition-colors"
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <span className="flex items-center justify-center">
          {isExpanded ? '←' : '→'}
        </span>
      </button>
    </div>
  );
}