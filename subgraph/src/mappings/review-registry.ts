import { BigInt } from "@graphprotocol/graph-ts";
import { ReviewSubmitted } from "../../generated/ReviewRegistry/ReviewRegistry";
import { Review, ProductRating, Order } from "../../generated/schema";
import {
  ZERO_BI,
  ONE_BI,
  ZERO_BD,
  bytes32ToId,
  calculateAverageRating,
} from "../utils";

export function handleReviewSubmitted(event: ReviewSubmitted): void {
  const reviewId = event.params.reviewId.toString();
  const orderId = bytes32ToId(event.params.orderId);
  const productId = event.params.productId.toString();

  // Create Review entity
  const review = new Review(reviewId);
  review.order = orderId;
  review.productId = event.params.productId;
  review.buyer = event.params.reviewer;
  review.rating = event.params.rating;
  review.contentHash = event.params.orderId; // Using orderId as placeholder for contentHash
  review.createdAt = event.block.timestamp;
  review.txHash = event.transaction.hash;
  review.blockNumber = event.block.number;
  review.save();

  // Update ProductRating aggregation
  let productRating = ProductRating.load(productId);

  if (!productRating) {
    productRating = new ProductRating(productId);
    productRating.totalRating = ZERO_BI;
    productRating.reviewCount = ZERO_BI;
    productRating.averageRating = ZERO_BD;
  }

  productRating.totalRating = productRating.totalRating.plus(
    BigInt.fromI32(event.params.rating)
  );
  productRating.reviewCount = productRating.reviewCount.plus(ONE_BI);
  productRating.averageRating = calculateAverageRating(
    productRating.totalRating,
    productRating.reviewCount
  );
  productRating.save();
}
