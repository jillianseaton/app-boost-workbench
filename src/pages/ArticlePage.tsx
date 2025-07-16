import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ArticlePage = () => {
  const { id } = useParams();
  
  const articles = [
    {
      id: 1,
      title: "Understanding Digital Payment Systems: A Comprehensive Guide",
      description: "Learn about modern payment processing, security measures, and how digital transactions work in today's economy.",
      author: "Payment Systems Team",
      readTime: "8 min read",
      date: "March 15, 2024",
      content: `
        Digital payment systems have revolutionized how we handle money transactions. From traditional credit card processing to modern cryptocurrency solutions, understanding these systems is crucial for both businesses and consumers.

        **Key Components of Digital Payments:**
        
        1. **Payment Processors**: Companies like Stripe, PayPal, and Square that handle the technical aspects of processing payments
        2. **Gateways**: Secure connections between merchants and payment processors
        3. **Merchant Accounts**: Special bank accounts that hold funds from card transactions
        4. **Security Protocols**: Encryption, tokenization, and fraud detection systems

        **Security Measures:**
        Modern payment systems employ multiple layers of security including PCI DSS compliance, SSL encryption, and advanced fraud detection algorithms. These measures protect both merchants and customers from unauthorized transactions.

        **Future Trends:**
        The payment industry continues to evolve with technologies like contactless payments, biometric authentication, and blockchain-based solutions becoming increasingly popular.
      `
    },
    {
      id: 2,
      title: "Building Secure Financial Applications: Best Practices",
      description: "Essential security practices for developing financial applications, including encryption, authentication, and compliance requirements.",
      author: "Security Team",
      readTime: "12 min read",
      date: "March 10, 2024",
      content: `
        When building financial applications, security isn't optional—it's fundamental. This guide covers essential practices for creating secure, compliant financial software.

        **Authentication & Authorization:**
        
        Implement multi-factor authentication (MFA) and role-based access control (RBAC). Use secure session management and implement proper logout procedures.

        **Data Protection:**
        
        - Encrypt data at rest and in transit
        - Use secure key management practices
        - Implement proper data backup and recovery procedures
        - Follow data retention policies and right-to-deletion requirements

        **Compliance Requirements:**
        
        Financial applications must comply with various regulations including PCI DSS, GDPR, PSD2, and local financial regulations. Regular security audits and penetration testing are essential.

        **API Security:**
        
        Secure your APIs with proper authentication, rate limiting, and input validation. Use HTTPS exclusively and implement proper error handling that doesn't leak sensitive information.
      `
    },
    {
      id: 3,
      title: "Cryptocurrency Integration: A Developer's Guide",
      description: "How to integrate cryptocurrency payments and blockchain technology into modern applications safely and effectively.",
      author: "Blockchain Team",
      readTime: "15 min read",
      date: "March 5, 2024",
      content: `
        Cryptocurrency integration offers new possibilities for global payments and financial applications. This guide provides practical insights for developers.

        **Popular Cryptocurrency Integration Methods:**
        
        1. **Payment Processors**: Services like BitPay and Coinbase Commerce
        2. **Direct Blockchain Integration**: Direct interaction with blockchain networks
        3. **Wallet APIs**: Integration with popular cryptocurrency wallets
        4. **Exchange APIs**: For applications requiring trading functionality

        **Technical Considerations:**
        
        - Handle transaction confirmations properly
        - Implement proper fee estimation
        - Account for network congestion and varying confirmation times
        - Secure private key management (never store on servers)

        **Regulatory Compliance:**
        
        Cryptocurrency regulations vary by jurisdiction. Ensure compliance with local laws regarding money transmission, KYC/AML requirements, and tax reporting obligations.

        **User Experience:**
        
        Design intuitive interfaces that educate users about cryptocurrency transactions, fees, and confirmation times. Provide clear status updates and error messages.
      `
    }
  ];

  const article = articles.find(a => a.id === parseInt(id || '1'));

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-block mb-6">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <article className="bg-white rounded-xl p-8 shadow-lg">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                {article.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {article.author}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {article.readTime}
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {article.date}
                </div>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              {article.content.split('\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;
                
                if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                  return (
                    <h3 key={index} className="text-xl font-semibold mt-8 mb-4 text-gray-900">
                      {trimmed.slice(2, -2)}
                    </h3>
                  );
                }
                
                if (trimmed.match(/^\d+\./)) {
                  return (
                    <p key={index} className="mb-2 font-medium">
                      {trimmed}
                    </p>
                  );
                }
                
                if (trimmed.startsWith('-')) {
                  return (
                    <li key={index} className="ml-4 mb-1">
                      {trimmed.slice(1).trim()}
                    </li>
                  );
                }
                
                return (
                  <p key={index} className="mb-4 leading-relaxed">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;