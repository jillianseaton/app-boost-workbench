import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AdSenseUnit from '@/components/ads/AdSenseUnit';

// Mock the useAdTracking hook
vi.mock('@/hooks/useAdTracking', () => ({
  useAdTracking: () => ({
    trackImpression: vi.fn(),
    trackClick: vi.fn(),
  }),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AdSenseUnit Component', () => {
  it('renders with required props', () => {
    renderWithRouter(
      <AdSenseUnit
        adSlot="1234567890"
        onImpression={vi.fn()}
        onAdClick={vi.fn()}
      />
    );
    
    const adElement = screen.getByRole('generic');
    expect(adElement).toBeInTheDocument();
  });

  it('sets correct data attributes', () => {
    renderWithRouter(
      <AdSenseUnit
        adSlot="1234567890"
        adFormat="auto"
        onImpression={vi.fn()}
        onAdClick={vi.fn()}
      />
    );
    
    const insElement = document.querySelector('.adsbygoogle');
    expect(insElement).toHaveAttribute('data-ad-client', 'ca-pub-9370068622982104');
    expect(insElement).toHaveAttribute('data-ad-slot', '1234567890');
    expect(insElement).toHaveAttribute('data-ad-format', 'auto');
  });

  it('handles fluid ad format correctly', () => {
    renderWithRouter(
      <AdSenseUnit
        adSlot="1234567890"
        adFormat="fluid"
        onImpression={vi.fn()}
        onAdClick={vi.fn()}
      />
    );
    
    const insElement = document.querySelector('.adsbygoogle');
    expect(insElement).toHaveAttribute('data-ad-format', 'fluid');
    expect(insElement).toHaveAttribute('data-ad-layout-key', '-fb-x-2-bu+wu');
  });

  it('calls onImpression when mounted', () => {
    const mockOnImpression = vi.fn();
    
    renderWithRouter(
      <AdSenseUnit
        adSlot="1234567890"
        onImpression={mockOnImpression}
        onAdClick={vi.fn()}
      />
    );
    
    expect(mockOnImpression).toHaveBeenCalledTimes(1);
  });

  it('applies custom className and style', () => {
    renderWithRouter(
      <AdSenseUnit
        adSlot="1234567890"
        className="custom-class"
        style={{ backgroundColor: 'red' }}
        onImpression={vi.fn()}
        onAdClick={vi.fn()}
      />
    );
    
    const wrapper = document.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
    
    const insElement = document.querySelector('.adsbygoogle');
    expect(insElement).toHaveStyle({ backgroundColor: 'red' });
  });
});