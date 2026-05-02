import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CartProvider } from './cart-context';
import { StoreProvider } from './store-context';
import Header from './header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Upgraded.co.in',
    default: 'Upgraded.co.in - Premium Indian Supplement Marketplace',
  },
  description: "India's most trusted multi-brand supplement marketplace. Whey Protein, Pre-Workout, Creatine, Vitamins & more from premium brands.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <StoreProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <WhatsAppButton />
          </CartProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
