import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TipSent } from "../../generated/TipJar/TipJar";
import { Tip, StreamerStats, DailyVolume } from "../../generated/schema";
import {
  ZERO_BI,
  ONE_BI,
  getDayId,
  getDayStartTimestamp,
} from "../utils";

export function handleTipSent(event: TipSent): void {
  // Create unique ID from tx hash + log index
  const tipId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());

  const tip = new Tip(tipId);
  tip.from = event.params.from;
  tip.streamer = event.params.streamerId;
  tip.amount = event.params.amount;
  tip.message = event.params.message;
  tip.createdAt = event.params.timestamp;
  tip.txHash = event.transaction.hash;
  tip.blockNumber = event.block.number;
  tip.save();

  // Update StreamerStats
  updateStreamerStats(
    event.params.streamerId,
    event.params.amount,
    true // isTip
  );

  // Update DailyVolume
  updateDailyTipVolume(event.block.timestamp, event.params.amount);
}

function updateStreamerStats(
  streamerId: Bytes,
  amount: BigInt,
  isTip: boolean
): void {
  const id = streamerId.toHexString();
  let stats = StreamerStats.load(id);

  if (!stats) {
    stats = new StreamerStats(id);
    stats.totalTips = ZERO_BI;
    stats.totalGifts = ZERO_BI;
    stats.tipCount = ZERO_BI;
    stats.giftCount = ZERO_BI;
  }

  if (isTip) {
    stats.totalTips = stats.totalTips.plus(amount);
    stats.tipCount = stats.tipCount.plus(ONE_BI);
  } else {
    stats.totalGifts = stats.totalGifts.plus(amount);
    stats.giftCount = stats.giftCount.plus(ONE_BI);
  }

  stats.save();
}

function updateDailyTipVolume(timestamp: BigInt, amount: BigInt): void {
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

  daily.tipVolume = daily.tipVolume.plus(amount);
  daily.tipCount = daily.tipCount.plus(ONE_BI);
  daily.save();
}

// Export helper for gift-shop to use
export { updateStreamerStats };
