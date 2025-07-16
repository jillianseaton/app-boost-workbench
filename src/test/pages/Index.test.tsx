import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';

// Mock components that might have complex dependencies
vi.mock('@/components/index/IndexHeader', () => ({
  default: () => <div data-testid="index-header">Index Header</div>,
}));

vi.mock('@/components/index/IndexHero', () => ({
  default: () => <div data-testid="index-hero">Index Hero</div>,
}));

vi.mock('@/components/UserProfile', () => ({
  default: () => <div data-testid="user-profile">User Profile</div>,
}));

vi.mock('@/components/StripePayoutSection', () => ({
  default: () => <div data-testid="stripe-payout">Stripe Payout</div>,
}));

vi.mock('@/components/ads/AdSenseUnit', () => ({
  default: ({ adSlot }: { adSlot: string }) => (
    <div data-testid={`adsense-${adSlot}`}>AdSense Unit</div>
  ),
}));

vi.mock('@/components/content/AboutSection', () => ({
  default: () => <div data-testid="about-section">About Section</div>,
}));

vi.mock('@/components/content/ServicesSection', () => ({
  default: () => <div data-testid="services-section">Services Section</div>,
}));

vi.mock('@/components/content/ArticleSection', () => ({
  default: () => <div data-testid="article-section">Article Section</div>,
}));

vi.mock('@/components/index/IndexPaymentCTA', () => ({
  default: () => <div data-testid="payment-cta">Payment CTA</div>,
}));

vi.mock('@/components/index/IndexFeaturedServices', () => ({
  default: () => <div data-testid="featured-services">Featured Services</div>,
}));

vi.mock('@/components/index/IndexDashboardLinks', () => ({
  default: () => <div data-testid="dashboard-links">Dashboard Links</div>,
}));

vi.mock('@/hooks/useAdTracking', () => ({
  useAdTracking: () => ({
    trackImpression: vi.fn(),
    trackClick: vi.fn(),
  }),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Index Page', () => {
  it('renders all main sections', () => {
    renderWithRouter(<Index />);
    
    expect(screen.getByTestId('index-header')).toBeInTheDocument();
    expect(screen.getByTestId('index-hero')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    expect(screen.getByTestId('stripe-payout')).toBeInTheDocument();
    expect(screen.getByTestId('about-section')).toBeInTheDocument();
    expect(screen.getByTestId('services-section')).toBeInTheDocument();
    expect(screen.getByTestId('article-section')).toBeInTheDocument();
    expect(screen.getByTestId('payment-cta')).toBeInTheDocument();
    expect(screen.getByTestId('featured-services')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-links')).toBeInTheDocument();
  });

  it('renders all AdSense units', () => {
    renderWithRouter(<Index />);
    
    expect(screen.getByTestId('adsense-4133257448')).toBeInTheDocument();
    expect(screen.getByTestId('adsense-9487572195')).toBeInTheDocument();
    expect(screen.getByTestId('adsense-6567849095')).toBeInTheDocument();
    expect(screen.getByTestId('adsense-3941685758')).toBeInTheDocument();
  });

  it('has payment intent demo link', () => {
    renderWithRouter(<Index />);
    
    const paymentLink = screen.getByRole('link', { name: /stripe payment intent demo/i });
    expect(paymentLink).toBeInTheDocument();
    expect(paymentLink).toHaveAttribute('href', '/payment-intent');
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = renderWithRouter(<Index />);
    
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-blue-50', 'to-indigo-100');
  });
});