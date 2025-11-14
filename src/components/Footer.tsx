import { MessageCircle } from "lucide-react";

const Footer = () => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/22892623483", "_blank");
  };

  const handleEmail = () => {
    window.location.href = "mailto:prosperatogo@gmail.com";
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo et description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary text-white p-2 rounded-lg">
                <span className="font-bold text-xl">P</span>
              </div>
              <span className="font-bold text-xl">PROSPERA Togo</span>
            </div>
            <p className="text-gray-300 mb-4">
              Votre partenaire de confiance en comptabilité, fiscalité et ressources humaines au Togo.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <div className="space-y-2 text-gray-300">
              <p>📞 +228 92 62 34 83</p>
              <p 
                className="cursor-pointer hover:text-white transition-colors"
                onClick={handleEmail}
              >
                ✉️ prosperatogo@gmail.com
              </p>
              <p>📍 Lomé, Togo</p>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liens Rapides</h3>
            <div className="space-y-2">
              <button 
                onClick={handleWhatsApp}
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
              <button 
                onClick={handleEmail}
                className="text-gray-300 hover:text-white transition-colors block"
              >
                Nous écrire
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 PROSPERA Togo – Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;