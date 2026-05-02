export const dynamic = 'force-dynamic';

import { Shield, CheckCircle, FileText, FlaskConical, Award, Truck } from 'lucide-react';

export const metadata = {
  title: 'Authenticity Guarantee | Upgraded.co.in',
  description: '100% Authentic products guaranteed. Direct from manufacturer, lab tested, GST invoice, money-back guarantee.',
};

export default function AuthenticityPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-primary/10 to-blue-50 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">100% Authentic. Guaranteed.</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Every product on Upgraded.co.in is verified for authenticity. Shop with confidence knowing you're getting genuine products every time.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Batch-Level Verification</h3>
              <p className="text-text-muted">
                Every product is tracked by batch number and expiry date. Scan the QR code on the packaging to verify authenticity instantly.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Direct from Manufacturer</h3>
              <p className="text-text-muted">
                No middlemen. We source directly from manufacturers and authorized distributors to ensure product integrity.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lab Tested Products</h3>
              <p className="text-text-muted">
                All supplements are lab tested for purity and potency. Certificates of analysis available on request.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">GST Invoice with Every Order</h3>
              <p className="text-text-muted">
                Get a valid GST invoice with every purchase, making it easy for businesses to claim input tax credit.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Money-Back Guarantee</h3>
              <p className="text-text-muted">
                Not satisfied? Return the product within 7 days for a full refund. No questions asked.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">How to Verify Your Product</h3>
              <ol className="list-decimal pl-5 text-text-muted space-y-2">
                <li>Locate the batch number and QR code on the product packaging.</li>
                <li>Visit our verification page and enter the batch number.</li>
                <li>Scan the QR code to instantly verify authenticity.</li>
                <li>Contact our support team if you have any concerns.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-light-bg py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Trusted by 10,000+ Customers</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="trust-badge"><CheckCircle className="w-5 h-5" /><span>100% Authentic</span></div>
            <div className="trust-badge"><Truck className="w-5 h-5" /><span>Fast Shipping</span></div>
            <div className="trust-badge"><FileText className="w-5 h-5" /><span>GST Invoicing</span></div>
            <div className="trust-badge"><Award className="w-5 h-5" /><span>Money-Back Guarantee</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}

