import { Link } from "wouter";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="px-4 py-3 bg-white shadow-inner md:hidden">
      <ul className="space-y-3">
        <li>
          <Link 
            href="/" 
            onClick={onClose}
            className="block text-primary font-medium"
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            href="/#calculators" 
            onClick={onClose}
            className="block text-neutral-900 hover:text-primary transition-colors"
          >
            Tools
          </Link>
        </li>
        <li>
          <Link 
            href="/about" 
            onClick={onClose}
            className="block text-neutral-900 hover:text-primary transition-colors"
          >
            About
          </Link>
        </li>
        <li>
          <Link 
            href="/contact" 
            onClick={onClose}
            className="block text-neutral-900 hover:text-primary transition-colors"
          >
            Contact
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default MobileMenu;
