import { aptos, EMBER_ADDRESS } from '@/lib/aptos';

// === Review Types ===

export interface Review {
  id: number;
  orderId: number;
  productId: number;
  reviewer: string;
  seller: string;
  rating: number;
  content: string;
  isVerified: boolean;
  createdAt: number;
}

// === Helper to parse Move struct responses ===

function parseReview(data: any): Review {
  return {
    id: Number(data.id),
    orderId: Number(data.order_id),
    productId: Number(data.product_id),
    reviewer: data.reviewer,
    seller: data.seller,
    rating: Number(data.rating),
    content: data.content,
    isVerified: Boolean(data.is_verified),
    createdAt: Number(data.created_at),
  };
}

// === Review Queries ===

export async function getReview(reviewId: number): Promise<Review | null> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::review_registry::get_review`,
        functionArguments: [reviewId],
      },
    });
    return parseReview(result[0]);
  } catch {
    return null;
  }
}

export async function getProductReviews(productId: number): Promise<Review[]> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::review_registry::get_product_reviews`,
        functionArguments: [productId],
      },
    });
    return (result[0] as any[]).map(parseReview);
  } catch {
    return [];
  }
}

export async function hasReviewedOrder(orderId: number): Promise<boolean> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::review_registry::has_reviewed_order`,
        functionArguments: [orderId],
      },
    });
    return Boolean(result[0]);
  } catch {
    return false;
  }
}

export async function getProductRating(
  productId: number
): Promise<{ avgRating: number; count: number }> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::review_registry::get_product_rating`,
        functionArguments: [productId],
      },
    });
    // Returns avg*100 for precision, and count
    const avgX100 = Number(result[0]);
    const count = Number(result[1]);
    return { avgRating: avgX100 / 100, count };
  } catch {
    return { avgRating: 0, count: 0 };
  }
}

export async function getReviewCount(): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::review_registry::get_review_count`,
        functionArguments: [],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}

export async function getUserReviews(userAddress: string): Promise<number[]> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::review_registry::get_user_reviews`,
        functionArguments: [userAddress],
      },
    });
    return (result[0] as any[]).map(Number);
  } catch {
    return [];
  }
}
