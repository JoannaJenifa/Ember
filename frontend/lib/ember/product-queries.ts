import { aptos, EMBER_ADDRESS } from '@/lib/aptos';

// === Product Types ===

export interface Product {
  id: number;
  seller: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  inventory: number;
  category: number;
  isActive: boolean;
  totalSold: number;
  ratingSum: number;
  ratingCount: number;
  createdAt: number;
}

// === Helper to parse Move struct responses ===

function parseProduct(data: any): Product {
  return {
    id: Number(data.id),
    seller: data.seller,
    title: data.title,
    description: data.description,
    imageUrl: data.image_url,
    price: Number(data.price),
    inventory: Number(data.inventory),
    category: data.category,
    isActive: Boolean(data.is_active),
    totalSold: Number(data.total_sold),
    ratingSum: Number(data.rating_sum),
    ratingCount: Number(data.rating_count),
    createdAt: Number(data.created_at),
  };
}

// === Product Queries ===

export async function getProduct(productId: number): Promise<Product | null> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::product_registry::get_product`,
        functionArguments: [productId],
      },
    });
    return parseProduct(result[0]);
  } catch {
    return null;
  }
}

export async function getSellerProducts(sellerAddress: string): Promise<number[]> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::product_registry::get_seller_products`,
        functionArguments: [sellerAddress],
      },
    });
    return (result[0] as any[]).map(Number);
  } catch {
    return [];
  }
}

export async function getSellerProductsFull(sellerAddress: string): Promise<Product[]> {
  const ids = await getSellerProducts(sellerAddress);
  const products = await Promise.all(ids.map((id) => getProduct(id)));
  return products.filter((p): p is Product => p !== null);
}

export async function getProductCount(): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::product_registry::get_product_count`,
        functionArguments: [],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}

export async function isProductActive(productId: number): Promise<boolean> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::product_registry::is_product_active`,
        functionArguments: [productId],
      },
    });
    return Boolean(result[0]);
  } catch {
    return false;
  }
}

export async function getProductPrice(productId: number): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::product_registry::get_product_price`,
        functionArguments: [productId],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}

/**
 * Fetch active products with pagination (iterates through IDs)
 */
export async function getActiveProducts(
  limit: number = 20,
  offset: number = 0
): Promise<Product[]> {
  const count = await getProductCount();
  const products: Product[] = [];
  let skipped = 0;

  for (let id = count; id >= 1 && products.length < limit; id--) {
    const product = await getProduct(id);
    if (product && product.isActive) {
      if (skipped >= offset) {
        products.push(product);
      } else {
        skipped++;
      }
    }
  }
  return products;
}

/**
 * Fetch products by category
 */
export async function getProductsByCategory(
  category: number,
  limit: number = 20
): Promise<Product[]> {
  const count = await getProductCount();
  const products: Product[] = [];

  for (let id = count; id >= 1 && products.length < limit; id--) {
    const product = await getProduct(id);
    if (product && product.isActive && product.category === category) {
      products.push(product);
    }
  }
  return products;
}
