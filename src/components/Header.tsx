import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const Header = () => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/22892623483", "_blank");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary text-white p-2 rounded-lg">
              <span className="font-bold text-xl">P</span>
            </div>
            <span className="font-bold text-xl text-gray-900">PROSPERA Togo</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              Accueil
            </Link>
            <Link 
              to="/services" 
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              Services
            </Link>
            <Link 
              to="/recrutement" 
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              Recrutement
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* WhatsApp Button */}
          <Button 
            onClick={handleWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;