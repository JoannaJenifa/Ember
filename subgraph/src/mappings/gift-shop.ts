import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  GiftCreated,
  GiftSent as GiftSentEvent,
} from "../../generated/GiftShop/GiftShop";
import {
  Gift,
  GiftSent,
  StreamerStats,
  DailyVolume,
} from "../../generated/schema";
import {
  ZERO_BI,
  ONE_BI,
  getDayId,
  getDayStartTimestamp,
} from "../utils";

export function handleGiftCreated(event: GiftCreated): void {
  const giftId = event.params.giftId.toString();

  const gift = new Gift(giftId);
  gift.name = event.params.name;
  gift.price = event.params.price;
  gift.animationURI = event.params.animationURI;
  gift.active = true;
  gift.createdAt = event.block.timestamp;
  gift.txHash = event.transaction.hash;
  gift.save();
}

export function handleGiftSent(event: GiftSentEvent): void {
  // Create unique ID from tx hash + log index
  const sentId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());

  const giftSent = new GiftSent(sentId);
  giftSent.from = event.params.from;
  giftSent.streamer = event.params.streamerId;
  giftSent.gift = event.params.giftId.toString();
  giftSent.quantity = event.params.quantity;
  giftSent.totalValue = event.params.totalValue;
  giftSent.createdAt = event.block.timestamp;
  giftSent.txHash = event.transaction.hash;
  giftSent.blockNumber = event.block.number;
  giftSent.save();

  // Update StreamerStats
  updateStreamerStatsForGift(
    event.params.streamerId,
    event.params.totalValue
  );

  // Update DailyVolume
  updateDailyGiftVolume(event.block.timestamp, event.params.totalValue);
}

function updateStreamerStatsForGift(streamerId: Bytes, amount: BigInt): void {
  const id = streamerId.toHexString();
  let stats = StreamerStats.load(id);

  if (!stats) {
    stats = new StreamerStats(id);
    stats.totalTips = ZERO_BI;
    stats.totalGifts = ZERO_BI;
    stats.tipCount = ZERO_BI;
    stats.giftCount = ZERO_BI;
  }

  stats.totalGifts = stats.totalGifts.plus(amount);
  stats.giftCount = stats.giftCount.plus(ONE_BI);
  stats.save();
}

function updateDailyGiftVolume(timestamp: BigInt, amount: BigInt): void {
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

  daily.giftVolume = daily.giftVolume.plus(amount);
  daily.giftCount = daily.giftCount.plus(ONE_BI);
  daily.save();
}
