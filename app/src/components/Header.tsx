import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <div className="flex items-center">
          <BookOpen className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold">Math Historian</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 ml-auto">
          <Link to="/">
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
              Home
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
              About
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden ml-auto"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <nav className="container mx-auto px-4 py-2 flex flex-col space-y-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                About
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;