import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, BookOpen } from 'lucide-react';

const ArticleSection = () => {
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

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Latest Articles & Insights
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest trends, best practices, and insights in payment processing, 
            financial technology, and secure application development.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {article.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {article.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {article.readTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {article.date}
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none text-gray-700">
                  {article.content.split('\n').slice(0, 3).map((paragraph, index) => (
                    <p key={index} className="mb-2">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
                
                <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
                  Read More →
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticleSection;