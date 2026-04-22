interface ShopifyConfig {
  shop: string;
  accessToken: string;
  apiVersion?: string;
}

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  status: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
}

interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  barcode: string | null;
  inventory_quantity: number;
  weight: number | null;
  weight_unit: string | null;
}

interface ShopifyImage {
  id: number;
  src: string;
  alt: string | null;
  position: number;
}

interface ShopifyCollection {
  id: number;
  title: string;
  handle: string;
  description: string;
  sort_order: string;
  published: boolean;
  image: ShopifyCollectionImage | null;
}

interface ShopifyCollectionImage {
  src: string;
  alt: string | null;
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  email: string;
  created_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  total_shipping: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  status: string;
  customer: ShopifyCustomer | null;
  shipping_address: ShopifyAddress | null;
  billing_address: ShopifyAddress | null;
  line_items: ShopifyLineItem[];
  shipping_lines: ShopifyShippingLine[];
}

interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  orders_count: number;
  total_spent: string;
  addresses: ShopifyAddress[];
}

interface ShopifyAddress {
  first_name: string | null;
  last_name: string | null;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string | null;
}

interface ShopifyLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  title: string;
  quantity: number;
  price: string;
  sku: string;
}

interface ShopifyShippingLine {
  id: number;
  title: string;
  price: string;
}

export class ShopifyService {
  private shop: string;
  private accessToken: string;
  private apiVersion: string;

  constructor(config: ShopifyConfig) {
    this.shop = config.shop;
    this.accessToken = config.accessToken;
    this.apiVersion = config.apiVersion || '2024-01';
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `https://${this.shop}/admin/api/${this.apiVersion}/${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProducts(limit = 250): Promise<ShopifyProduct[]> {
    const data = await this.request<{ products: ShopifyProduct[] }>(
      `products.json?limit=${limit}`
    );
    return data.products;
  }

  async getProduct(id: number): Promise<ShopifyProduct> {
    const data = await this.request<{ product: ShopifyProduct }>(`products/${id}.json`);
    return data.product;
  }

  async getCollections(limit = 250): Promise<ShopifyCollection[]> {
    const data = await this.request<{ custom_collections: ShopifyCollection[] }>(
      `custom_collections.json?limit=${limit}`
    );
    return data.custom_collections;
  }

  async getOrders(status: string = 'any', limit = 250): Promise<ShopifyOrder[]> {
    const data = await this.request<{ orders: ShopifyOrder[] }>(
      `orders.json?status=${status}&limit=${limit}`
    );
    return data.orders;
  }

  async getCustomers(limit = 250): Promise<ShopifyCustomer[]> {
    const data = await this.request<{ customers: ShopifyCustomer[] }>(
      `customers.json?limit=${limit}`
    );
    return data.customers;
  }

  async getOrdersCount(status: string = 'any'): Promise<number> {
    const data = await this.request<{ count: number }>(
      `orders/count.json?status=${status}`
    );
    return data.count;
  }

  async getProductsCount(): Promise<number> {
    const data = await this.request<{ count: number }>('products/count.json');
    return data.count;
  }

  async getCustomersCount(): Promise<number> {
    const data = await this.request<{ count: number }>('customers/count.json');
    return data.count;
  }
}

export type { ShopifyProduct, ShopifyCollection, ShopifyOrder, ShopifyCustomer };
