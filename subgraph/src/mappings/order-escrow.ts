import { BigInt } from "@graphprotocol/graph-ts";
import {
  OrderCreated,
  OrderConfirmed,
  OrderDisputed,
  OrderRefunded,
  OrderAutoReleased,
} from "../../generated/OrderEscrow/OrderEscrow";
import { Order, DailyVolume } from "../../generated/schema";
import {
  ZERO_BI,
  ONE_BI,
  bytes32ToId,
  getDayId,
  getDayStartTimestamp,
} from "../utils";

export function handleOrderCreated(event: OrderCreated): void {
  const orderId = bytes32ToId(event.params.orderId);

  const order = new Order(orderId);
  order.buyer = event.params.buyer;
  order.seller = event.params.seller;
  order.productId = event.params.productId;
  order.amount = event.params.amount;
  order.status = "ACTIVE";
  order.createdAt = event.block.timestamp;
  order.txHash = event.transaction.hash;
  order.blockNumber = event.block.number;
  order.save();

  // Update daily volume
  updateDailyOrderVolume(event.block.timestamp, event.params.amount);
}

export function handleOrderConfirmed(event: OrderConfirmed): void {
  const orderId = bytes32ToId(event.params.orderId);
  const order = Order.load(orderId);

  if (order) {
    order.status = "CONFIRMED";
    order.confirmedAt = event.block.timestamp;
    order.releasedAmount = event.params.releasedAmount;
    order.save();
  }
}

export function handleOrderDisputed(event: OrderDisputed): void {
  const orderId = bytes32ToId(event.params.orderId);
  const order = Order.load(orderId);

  if (order) {
    order.status = "DISPUTED";
    order.save();
  }
}

export function handleOrderRefunded(event: OrderRefunded): void {
  const orderId = bytes32ToId(event.params.orderId);
  const order = Order.load(orderId);

  if (order) {
    order.status = "REFUNDED";
    order.save();
  }
}

export function handleOrderAutoReleased(event: OrderAutoReleased): void {
  const orderId = bytes32ToId(event.params.orderId);
  const order = Order.load(orderId);

  if (order) {
    order.status = "AUTO_RELEASED";
    order.confirmedAt = event.block.timestamp;
    order.releasedAmount = event.params.releasedAmount;
    order.save();
  }
}

function updateDailyOrderVolume(timestamp: BigInt, amount: BigInt): void {
  const dayId = getDayId(timestamp);
  let daily = DailyVolume.load(dayId);

  if (!daily) {
    daily = new DailyVolume(dayId);
    daily.date = getDayStartTimestamp(timestamp);
    daily.orderVolume = ZERO_BI;
    daily.tipVolume = ZERO_BI;
    daily.giftVolume = ZERO_BI;
    daily.orderCount = ZERO_BI;
    daily.tipCount = ZERO_BI;
    daily.giftCount = ZERO_BI;
  }

  daily.orderVolume = daily.orderVolume.plus(amount);
  daily.orderCount = daily.orderCount.plus(ONE_BI);
  daily.save();
}
