import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from './cart-context';
import { StoreProvider } from './store-context';

export const metadata: Metadata = {
  title: 'HD MUSCLE - Premium Fitness Supplements',
  description: "India's most trusted fitness supplement brand. Whey Protein, Pre-Workout, Mass Gainer & more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StoreProvider>
          <CartProvider>{children}</CartProvider>
        </StoreProvider>
      </body>
    </html>
  );
}