import { BigInt } from "@graphprotocol/graph-ts";
import {
  SellerRegistered,
  SellerUpdated,
  SellerDeactivated,
  SellerReactivated,
  SellerSaleRecorded,
  SellerRegistry,
} from "../../generated/SellerRegistry/SellerRegistry";
import { Seller } from "../../generated/schema";

export function handleSellerRegistered(event: SellerRegistered): void {
  let seller = new Seller(event.params.sellerId.toString());

  seller.wallet = event.params.wallet;
  seller.shopName = event.params.shopName;
  seller.category = event.params.category;
  seller.isActive = true;
  seller.createdAt = event.block.timestamp;
  seller.totalSales = BigInt.zero();
  seller.totalOrders = BigInt.zero();
  seller.txHash = event.transaction.hash;
  seller.blockNumber = event.block.number;

  // Fetch metadataURI from contract since it's not in the event
  let contract = SellerRegistry.bind(event.address);
  let sellerData = contract.try_getSeller(event.params.sellerId);
  if (!sellerData.reverted) {
    seller.metadataURI = sellerData.value.metadataURI;
  } else {
    seller.metadataURI = "";
  }

  seller.save();
}

export function handleSellerUpdated(event: SellerUpdated): void {
  let seller = Seller.load(event.params.sellerId.toString());
  if (seller == null) return;

  seller.metadataURI = event.params.metadataURI;
  seller.save();
}

export function handleSellerDeactivated(event: SellerDeactivated): void {
  let seller = Seller.load(event.params.sellerId.toString());
  if (seller == null) return;

  seller.isActive = false;
  seller.save();
}

export function handleSellerReactivated(event: SellerReactivated): void {
  let seller = Seller.load(event.params.sellerId.toString());
  if (seller == null) return;

  seller.isActive = true;
  seller.save();
}

export function handleSellerSaleRecorded(event: SellerSaleRecorded): void {
  let seller = Seller.load(event.params.sellerId.toString());
  if (seller == null) return;

  seller.totalSales = seller.totalSales.plus(event.params.amount);
  seller.totalOrders = seller.totalOrders.plus(BigInt.fromI32(1));
  seller.save();
}
