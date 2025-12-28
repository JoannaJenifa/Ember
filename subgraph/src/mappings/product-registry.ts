import { BigInt } from "@graphprotocol/graph-ts";
import {
  ProductCreated,
  ProductUpdated,
  ProductPriceUpdated,
  ProductInventoryUpdated,
  ProductDeactivated,
  ProductReactivated,
  ProductSold,
  ProductRegistry,
} from "../../generated/ProductRegistry/ProductRegistry";
import { Product, Seller } from "../../generated/schema";

export function handleProductCreated(event: ProductCreated): void {
  let product = new Product(event.params.productId.toString());

  // Load seller to establish relationship
  let seller = Seller.load(event.params.sellerId.toString());
  if (seller == null) return;

  product.seller = seller.id;
  product.title = event.params.title;
  product.priceVery = event.params.priceVery;
  product.isActive = true;
  product.createdAt = event.block.timestamp;
  product.totalSold = BigInt.zero();
  product.txHash = event.transaction.hash;
  product.blockNumber = event.block.number;

  // Fetch additional data from contract (category, inventory, metadataURI)
  let contract = ProductRegistry.bind(event.address);
  let productData = contract.try_getProduct(event.params.productId);
  if (!productData.reverted) {
    product.category = productData.value.category;
    product.inventory = productData.value.inventory;
    product.metadataURI = productData.value.metadataURI;
  } else {
    product.category = "";
    product.inventory = BigInt.zero();
    product.metadataURI = "";
  }

  product.save();
}

export function handleProductUpdated(event: ProductUpdated): void {
  let product = Product.load(event.params.productId.toString());
  if (product == null) return;

  product.metadataURI = event.params.metadataURI;
  product.save();
}

export function handleProductPriceUpdated(event: ProductPriceUpdated): void {
  let product = Product.load(event.params.productId.toString());
  if (product == null) return;

  product.priceVery = event.params.newPrice;
  product.save();
}

export function handleProductInventoryUpdated(
  event: ProductInventoryUpdated
): void {
  let product = Product.load(event.params.productId.toString());
  if (product == null) return;

  product.inventory = event.params.newInventory;
  product.save();
}

export function handleProductDeactivated(event: ProductDeactivated): void {
  let product = Product.load(event.params.productId.toString());
  if (product == null) return;

  product.isActive = false;
  product.save();
}

export function handleProductReactivated(event: ProductReactivated): void {
  let product = Product.load(event.params.productId.toString());
  if (product == null) return;

  product.isActive = true;
  product.save();
}

export function handleProductSold(event: ProductSold): void {
  let product = Product.load(event.params.productId.toString());
  if (product == null) return;

  product.totalSold = product.totalSold.plus(event.params.quantity);
  product.inventory = product.inventory.minus(event.params.quantity);
  product.save();
}
