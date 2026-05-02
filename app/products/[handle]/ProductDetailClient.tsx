'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/cart-context';
import QuantitySelector from '@/components/QuantitySelector';
import Breadcrumb from '@/components/Breadcrumb';
import Accordion from '@/components/Accordion';
import { Star, CheckCircle, Truck, Shield, MessageCircle, Percent, Tag } from 'lucide-react';
import type { ProductDetail, Brand, Variant, Inventory } from '@/lib/data/types';

interface ProductDetailClientProps {
  productDetail: ProductDetail;
  brand: Brand | null;
  relatedProducts: ProductDetail[];
  similarProducts: ProductDetail[];
}

export default function ProductDetailClient({
  productDetail,
  brand,
  relatedProducts,
  similarProducts,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const { product, variants, images, inventories, compliance } = productDetail;

  const flavors = useMemo(() => [...new Set(variants.map(v => v.flavor).filter(Boolean))], [variants]);
  const sizesForFlavor = useMemo(() => {
    const filtered = selectedFlavor ? variants.filter(v => v.flavor === selectedFlavor) : variants;
    return [...new Set(filtered.map(v => v.size).filter(Boolean))];
  }, [variants, selectedFlavor]);

  const selectedVariant = useMemo(() => {
    let filtered = variants;
    if (selectedFlavor) filtered = filtered.filter(v => v.flavor === selectedFlavor);
    if (selectedSize) filtered = filtered.filter(v => v.size === selectedSize);
    return filtered[0] || variants[0];
  }, [variants, selectedFlavor, selectedSize]);

  const selectedInventory = useMemo(() => {
    if (!selectedVariant) return null;
    return inventories.find(inv => inv.sku === selectedVariant.sku) || null;
  }, [inventories, selectedVariant]);

  const mainImage = useMemo(() => {
    if (selectedImage) return selectedImage;
    const main = images.find(img => img.image_type === 'main');
    return main?.image_path || images[0]?.image_path || '';
  }, [images, selectedImage]);

  const thumbnails = useMemo(() => [...images].sort((a, b) => a.sort_order - b.sort_order), [images]);

  useEffect(() => {
    if (variants.length > 0) {
      if (!selectedFlavor) setSelectedFlavor(variants[0].flavor || '');
      if (!selectedSize) setSelectedSize(variants[0].size || '');
    }
  }, [variants, selectedFlavor, selectedSize]);

  const discountPercent = selectedVariant ? Math.round(((selectedVariant.mrp - selectedVariant.sale_price) / selectedVariant.mrp) * 100) : 0;
  const deliveryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }, []);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: product.category, href: `/categories/${product.category.toLowerCase().replace(/\s+/g, '-')}` },
    { label: product.title, href: '#' },
  ];

  const stockStatus = selectedInventory?.stock_status || 'out_of_stock';
  const stockBadge = {
    in_stock: { text: 'In Stock', color: 'bg-green-100 text-green-800' },
    out_of_stock: { text: 'Out of Stock', color: 'bg-red-100 text-red-800' },
    low_stock: { text: 'Low Stock', color: 'bg-orange-100 text-orange-800' },
    preorder: { text: 'Preorder', color: 'bg-blue-100 text-blue-800' },
  }[stockStatus];

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem({
      id: selectedVariant.sku,
      title: `${product.title}${selectedFlavor ? ` - ${selectedFlavor}` : ''}${selectedSize ? ` - ${selectedSize}` : ''}`,
      price: selectedVariant.sale_price,
      image: mainImage,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkout';
  };

  const complianceData = compliance[0] || null;
  const faqItems: { question: string; answer: string }[] = [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border-light">
              {mainImage && <Image src={mainImage} alt={product.title} fill className="object-cover" priority />}
            </div>
            {thumbnails.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {thumbnails.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.image_path)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                      selectedImage === img.image_path || (!selectedImage && img.image_type === 'main')
                        ? 'border-primary'
                        : 'border-border-light'
                    }`}
                  >
                    <Image src={img.image_path} alt={img.alt_text || product.title} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {brand && (
              <Link href={`/brands/${brand.slug}`} className="text-sm text-text-muted hover:text-primary transition-colors">
                {brand.name}
              </Link>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.title}</h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${star <= 4.5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-text-muted">4.5 (120 Reviews)</span>
            </div>

            <div className="flex items-center gap-4">
              {selectedVariant && (
                <>
                  <span className="text-2xl font-bold text-gray-900">₹{selectedVariant.sale_price}</span>
                  {selectedVariant.mrp > selectedVariant.sale_price && (
                    <>
                      <span className="text-lg text-text-muted line-through">₹{selectedVariant.mrp}</span>
                      <span className="badge-sale">{discountPercent}% OFF</span>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockBadge.color}`}>{stockBadge.text}</span>
              <div className="flex items-center gap-1 text-sm text-text-muted">
                <Shield className="w-4 h-4 text-primary" />
                <span>100% Authentic</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Truck className="w-4 h-4" />
              <span>Delivered by {deliveryDate} | Free shipping over ₹499</span>
            </div>

            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                <Percent className="w-3 h-3" /> Bank Offers
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                <Tag className="w-3 h-3" /> Coupon Available
              </span>
            </div>

            {flavors.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">Flavor</h3>
                <div className="flex flex-wrap gap-2">
                  {flavors.map((flavor) => (
                    <button
                      key={flavor}
                      onClick={() => {
                        setSelectedFlavor(flavor);
                        const sizes = variants.filter(v => v.flavor === flavor).map(v => v.size);
                        if (sizes.length > 0) setSelectedSize(sizes[0]);
                      }}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedFlavor === flavor ? 'border-primary bg-primary/10 text-primary' : 'border-border-light hover:border-primary/50'
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizesForFlavor.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizesForFlavor.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedSize === size ? 'border-primary bg-primary/10 text-primary' : 'border-border-light hover:border-primary/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Quantity</h3>
              <QuantitySelector value={quantity} onChange={setQuantity} max={selectedInventory?.stock || 10} />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={stockStatus === 'out_of_stock'}
                className="btn-filled flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={stockStatus === 'out_of_stock'}
                className="btn-outlined flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            <Link
              href={`https://wa.me/919876543210?text=Hi,%20I%20need%20help%20with%20${product.handle}`}
              target="_blank"
              className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Need help? Chat with us</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 space-y-12">
          {complianceData?.directions && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
              <p className="text-gray-600">{complianceData.directions}</p>
            </section>
          )}

          {complianceData?.ingredients && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
              <p className="text-text-muted">{complianceData.ingredients}</p>
            </section>
          )}

          {complianceData?.nutrition_facts && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nutrition Facts</h2>
              <div className="border border-border-light rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {complianceData.nutrition_facts.split('\n').map((row, i) => {
                      const [key, value] = row.split(':');
                      return (
                        <tr key={i} className={i % 2 === 0 ? 'bg-light-bg' : 'bg-white'}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{key}</td>
                          <td className="px-4 py-3 text-sm text-text-muted text-right">{value}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {brand && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Brand Information</h2>
              <p className="text-text-muted">{brand.description}</p>
              {brand.country_of_origin && <p className="text-sm text-text-muted mt-2">Country of Origin: {brand.country_of_origin}</p>}
            </section>
          )}

          {(complianceData?.manufacturer || complianceData?.importer) && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Manufacturer & Importer</h2>
              {complianceData.manufacturer && <p className="text-text-muted">Manufacturer: {complianceData.manufacturer}</p>}
              {complianceData.importer && <p className="text-text-muted mt-1">Importer: {complianceData.importer}</p>}
            </section>
          )}

          {selectedInventory && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Batch & Expiry</h2>
              {selectedInventory.batch_number && <p className="text-text-muted">Batch Number: {selectedInventory.batch_number}</p>}
              {selectedInventory.expiry_date && (
                <p className="text-text-muted mt-1">Expiry Date: {new Date(selectedInventory.expiry_date).toLocaleDateString('en-IN')}</p>
              )}
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
              <button className="btn-ghost text-sm">Write a Review</button>
            </div>
            <div className="bg-light-bg rounded-xl p-6 text-center">
              <p className="text-text-muted">No reviews yet. Be the first to review this product!</p>
            </div>
          </section>

          {faqItems.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <Accordion items={faqItems} />
            </section>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link href={`/products/${p.product.handle}`} key={p.product.handle} className="group">
                  <div className="border border-border-light rounded-xl overflow-hidden hover:shadow-card-hover transition-shadow">
                    <div className="relative aspect-square">
                      <Image
                        src={p.images.find(img => img.image_type === 'main')?.image_path || ''}
                        alt={p.product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{p.product.title}</h3>
                      <p className="text-sm text-primary font-bold mt-2">₹{p.variants[0]?.sale_price || '--'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {similarProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Similar Products from Other Brands</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((p) => (
                <Link href={`/products/${p.product.handle}`} key={p.product.handle} className="group">
                  <div className="border border-border-light rounded-xl overflow-hidden hover:shadow-card-hover transition-shadow">
                    <div className="relative aspect-square">
                      <Image
                        src={p.images.find(img => img.image_type === 'main')?.image_path || ''}
                        alt={p.product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{p.product.title}</h3>
                      <p className="text-xs text-text-muted">{p.product.brand_slug}</p>
                      <p className="text-sm text-primary font-bold mt-2">₹{p.variants[0]?.sale_price || '--'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-light p-4 md:hidden z-50 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-muted">Price</p>
            <p className="text-lg font-bold text-gray-900">₹{selectedVariant?.sale_price || '--'}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={stockStatus === 'out_of_stock'}
            className="btn-filled px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
