"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { products, Product } from "@/lib/data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFlavor, setSelectedFlavor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { id } = await params;
      const found = products.find(p => p.handle === id || p.id.toString() === id);
      if (found) setProduct(found);
    };
    fetchProduct();
  }, [params]);

  if (!product) {
    return (
      <main>
        <Header />
        <div className="pt-[88px] min-h-screen flex items-center justify-center pb-16">
          <div className="text-center">
            <h1 className="font-oswald text-2xl text-[#1d1d1d] mb-4">Product Not Found</h1>
            <Link href="/collections/shop-all-supplements" className="text-[#ffcc00] hover:underline">
              Browse all products →
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const flavors = product.flavors || [];
  const reviews = ((product.id * 7) % 50) + 5;

  return (
    <main>
      <Header />
      <div className="pt-[88px] pb-16">
        <div className="max-w-[1100px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-[#737373] hover:text-[#1d1d1d]">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/collections/${product.category.toLowerCase().replace(/[-\s]/g, "-")}`} className="text-[#737373] hover:text-[#1d1d1d]">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#1d1d1d]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-[#fafafa] rounded-lg overflow-hidden">
              <Image
                src={product.images?.[selectedImage] || product.image}
                alt={product.name}
                fill
                className="object-contain p-4"
                priority
              />
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="absolute top-4 left-4 bg-[#ffcc00] text-black text-sm font-bold px-3 py-1">
                  SALE
                </span>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded border-2 ${
                      selectedImage === idx ? "border-[#1d1d1d]" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-contain rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="font-oswald text-2xl md:text-3xl font-bold text-[#1d1d1d] mb-2">
              {product.name}
            </h1>

            {/* Reviews */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-[#f6a529]" fill="#f6a529" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-[#737373]">({reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {product.compareAtPrice ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[#1d1d1d]">${product.price}</span>
                  <span className="text-lg text-[#737373] line-through">${product.compareAtPrice}</span>
                  <span className="bg-[#ffcc00] text-black text-sm font-bold px-2 py-0.5">
                    {Math.round((1 - product.price / product.compareAtPrice) * 100)}% off
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-[#1d1d1d]">${product.price}</span>
              )}
            </div>

            {/* Flavors */}
            {flavors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#1d1d1d] mb-2">
                  Flavor: <span className="font-normal text-[#737373]">{flavors[selectedFlavor]}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {flavors.map((flavor: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFlavor(idx)}
                      className={`px-4 py-2 text-sm border rounded transition-colors ${
                        selectedFlavor === idx
                          ? "border-[#1d1d1d] bg-[#1d1d1d] text-white"
                          : "border-[#e5e5e5] text-[#1d1d1d] hover:border-[#1d1d1d]"
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1d1d1d] mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-[#e5e5e5] rounded flex items-center justify-center hover:border-[#1d1d1d]"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-[#e5e5e5] rounded flex items-center justify-center hover:border-[#1d1d1d]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button className="w-full bg-[#1d1d1d] text-white py-4 font-oswald font-bold text-lg uppercase hover:bg-[#ffcc00] hover:text-[#1d1d1d] transition-colors mb-4">
              Add to Cart
            </button>

            {/* Product Details */}
            <div className="border-t border-[#e5e5e5] pt-6 mt-6">
              <h3 className="font-oswald text-sm font-bold text-[#1d1d1d] uppercase mb-3">Product Details</h3>
              <div className="space-y-2 text-sm text-[#737373]">
                <p><span className="font-medium text-[#1d1d1d]">Servings:</span> {product.servings}</p>
                {product.weight && <p><span className="font-medium text-[#1d1d1d]">Weight:</span> {product.weight}</p>}
              </div>
              
              {product.description && (
                <p className="mt-4 text-sm text-[#737373] leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}