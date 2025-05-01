import { Link } from "wouter";
import { GraduationCap, Instagram, Twitter, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <GraduationCap className="text-primary w-6 h-6 mr-3" />
              <h2 className="text-xl font-semibold">AcademyHub</h2>
            </div>
            <p className="text-white/60 mt-2">Academic tools for high school success</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <Link href="/" className="text-white/80 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/#calculators" className="text-white/80 hover:text-primary transition-colors">
              Tools
            </Link>
            <Link href="/about" className="text-white/80 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-white/80 hover:text-primary transition-colors">
              Contact
            </Link>
            <Link href="#" className="text-white/80 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-white/80 hover:text-primary transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} AcademyHub. All rights reserved.</p>
          
          <div className="flex space-x-4">
            <a href="#" className="text-white/60 hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/60 hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/60 hover:text-primary transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" /> 
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
