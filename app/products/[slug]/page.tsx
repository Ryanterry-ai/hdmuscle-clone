import { products } from "@/lib/data";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.handle,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.handle === slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-oswald text-2xl font-bold">Product Not Found</h1>
          <p className="text-[#737373] mt-2">The product you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const inrPrice = product.price * 92.5;
  const benefits = [
    "Explosive energy and focus",
    "Decreased fatigue and greater endurance",
    "Heightened alertness and intensity",
    "Euphoria and heightened senses",
    "Increased muscle blood flow",
    "Unprecedented muscle pumps",
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-[#737373]">
          <a href="/" className="hover:text-[#1d1d1d]">Home</a> &gt;{" "}
          <a href={`https://hdmuscle.com/collections/${product.category.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="hover:text-[#1d1d1d]">
            {product.category}
          </a> &gt;{" "}
          <span className="text-[#1d1d1d]">{product.name}</span>
        </div>

        {/* Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <ProductGallery
            images={product.images}
            productName={product.name}
          />

          {/* Info */}
          <ProductInfo product={product} />
        </div>

        {/* Product Details */}
        <div className="mt-12">
          <ProductTabs
            description={product.description}
            benefits={benefits}
            ingredients={`Flavors: ${product.flavors.join(", ")}\n\nServings: ${product.servings}\n\nWeight: ${product.weight}`}
          />
        </div>

        {/* Reviews Section */}
        <div className="mt-12 py-8 border-t border-[#e5e5e5]">
          <h2 className="font-oswald text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="#f6a529"
                  stroke="#f6a529"
                  strokeWidth={2}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-[#737373]">4.9 out of 5 (128 reviews)</span>
          </div>
          <p className="text-[#737373] mt-4">
            Reviews are from hdmuscle.com. <a href={`https://hdmuscle.com/products/${product.handle}`} className="text-[#1d1d1d] underline">See all reviews</a>
          </p>
        </div>

        {/* Related Products */}
        <div className="mt-12 py-8 border-t border-[#e5e5e5]">
          <h2 className="font-oswald text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products
              .filter((p) => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <a
                  key={relatedProduct.id}
                  href={`https://hdmuscle.com/products/${relatedProduct.handle}`}
                  className="group block"
                >
                  <div className="relative aspect-square bg-[#fafafa] rounded-lg overflow-hidden mb-2">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="object-contain w-full h-full p-4"
                    />
                  </div>
                  <h3 className="font-oswald text-sm font-medium group-hover:text-[#ffcc00] transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-sm font-bold mt-1">
                    {formatPrice(relatedProduct.price * 92.5)}
                  </p>
                </a>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: number) {
  return "₹" + price.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}