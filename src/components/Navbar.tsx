import Link from 'next/link';

type NavbarProps = {
  title?: string;
  username?: string;
  userInitials?: string;
};

const Navbar: React.FC<NavbarProps> = ({ 
  title = "Therapios", 
  username = "User Therapist",
  userInitials = "UT"
}) => {
  return (
    <nav className="w-full bg-white border-b border-gray-300 p-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center text-[#0f2c59] font-bold text-xl mr-10">
            <LogoIcon className="mr-2" />
            {title}
          </Link>
          <div className="flex space-x-1">
            <Link href="/wireframes/dashboard" className="px-3 py-1 rounded-md bg-gray-100 text-gray-800 text-sm hover:bg-gray-200">
              Dashboard
            </Link>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-end mr-2">
              <span className="font-medium text-sm text-gray-800">{username}</span>
              <span className="text-xs text-gray-700">Therapist</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
              {userInitials}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Simple logo component for Therapios
const LogoIcon = ({ className = "" }: { className?: string }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="#0f2c59"/>
    </svg>
  );
};

export default Navbar; 