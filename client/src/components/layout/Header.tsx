import { useState } from "react";
import { Link, useLocation } from "wouter";
import MobileMenu from "./MobileMenu";
import { GraduationCap } from "lucide-react";

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <GraduationCap className="text-primary w-8 h-8 mr-3" />
          <h1 className="text-2xl font-semibold text-neutral-900">AcademyHub</h1>
        </div>
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <Link href="/" className={`${isActive("/") ? "text-primary font-medium" : "text-neutral-900 hover:text-primary transition-colors"}`}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/#calculators" className="text-neutral-900 hover:text-primary transition-colors">
                Tools
              </Link>
            </li>
            <li>
              <Link href="/about" className={`${isActive("/about") ? "text-primary font-medium" : "text-neutral-900 hover:text-primary transition-colors"}`}>
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className={`${isActive("/contact") ? "text-primary font-medium" : "text-neutral-900 hover:text-primary transition-colors"}`}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <button 
          className="md:hidden text-neutral-900 focus:outline-none" 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <MobileMenu isOpen={showMobileMenu} onClose={toggleMobileMenu} />
    </header>
  );
};

export default Header;
