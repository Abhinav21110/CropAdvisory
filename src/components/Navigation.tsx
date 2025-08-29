import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Lightbulb, 
  TestTube, 
  Cloud, 
  Bug, 
  TrendingUp, 
  MessageCircle, 
  MessageSquare,
  Menu,
  X,
  Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const navigation = [
  { name: "dashboard", href: "/", icon: Home },
  { name: "advisory", href: "/advisory", icon: Lightbulb },
  { name: "soilHealth", href: "/soil", icon: TestTube },
  { name: "weather", href: "/weather", icon: Cloud },
  { name: "pestDetection", href: "/pests", icon: Bug },
  { name: "marketPrices", href: "/market", icon: TrendingUp },
  { name: "chatbot", href: "/chat", icon: MessageCircle },
  { name: "feedback", href: "/feedback", icon: MessageSquare },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setIsNavbarHidden(true);
        setIsPromptDismissed(false); // Reset prompt when navbar hides
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsNavbarHidden(false);
        setIsPromptDismissed(false); // Reset prompt when navbar shows
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div>
    <Card className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-lg shadow-[var(--shadow-soft)] transition-smooth">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-xl transition-smooth hover:scale-110">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-foreground">
                CropCare
              </h1>
              <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="mt-4 pt-4 border-t md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth hover:bg-accent/50 ${
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{t(item.name)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

    </Card>

      {/* Desktop Navigation - Floating */}
      <div className={`hidden md:block fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${
        isNavbarHidden ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}>
        <Card className="bg-card/95 backdrop-blur-lg shadow-[var(--shadow-strong)] border-primary/20">
          <div className="flex items-center p-3 space-x-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth hover:bg-accent/50 ${
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{t(item.name)}</span>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Scroll Up Prompt for Bottom Navbar */}
      {isNavbarHidden && !isPromptDismissed && (
        <div className="hidden md:block fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-card/95 backdrop-blur-lg shadow-lg border border-primary/20 rounded-lg px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center space-x-3">
              <p className="text-sm text-muted-foreground">
                Scroll up to show navbar
              </p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 hover:bg-accent/50"
                onClick={() => setIsPromptDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}