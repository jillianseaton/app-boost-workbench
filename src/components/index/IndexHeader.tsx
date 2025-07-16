
import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, LogIn } from 'lucide-react';

const IndexHeader = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-700">
          EarnFlow
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/payment" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <CreditCard className="h-4 w-4" />
                Make Payment
              </Link>
            </li>
            <li>
              <Link to="/auth" className="flex items-center gap-2 text-blue-500 hover:text-blue-700">
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="text-blue-500 hover:text-blue-700">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/production-test" className="text-blue-500 hover:text-blue-700">
                Production Test
              </Link>
            </li>
            <li>
              <Link to="/affiliate-revenue" className="text-blue-500 hover:text-blue-700">
                Affiliate Partners
              </Link>
            </li>
            <li>
              <Link to="/optimization-services" className="text-blue-500 hover:text-blue-700">
                Services
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-blue-500 hover:text-blue-700">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-blue-500 hover:text-blue-700">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default IndexHeader;
