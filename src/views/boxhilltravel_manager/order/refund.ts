import type { OrderAmount, OrderVO } from '@/api/boxhilltravel_manager/order/types';

/** Convert decimal text without rounding a refund up to the next currency unit. */
export const moneyToMinor = (amount: OrderAmount, fractionDigits: number): number | null => {
  const text = String(amount ?? '').trim();
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  if (/[1-9]/.test(fraction.slice(fractionDigits))) return null;
  const minor =
    Number(whole) * 10 ** fractionDigits + Number(fraction.slice(0, fractionDigits).padEnd(fractionDigits, '0'));
  return Number.isSafeInteger(minor) ? minor : null;
};

export const minorToAmount = (amount: number, fractionDigits: number): string => {
  const text = String(amount).padStart(fractionDigits + 1, '0');
  return fractionDigits ? `${text.slice(0, -fractionDigits)}.${text.slice(-fractionDigits)}` : text;
};

export const getRefundBalance = (order: OrderVO | undefined, fractionDigits: number) => {
  const paid = moneyToMinor(order?.paidAmount ?? 0, fractionDigits);
  const recordedRefunded = moneyToMinor(order?.refundedAmount ?? 0, fractionDigits);
  let succeeded = 0;
  let pending = 0;
  let valid = paid !== null && recordedRefunded !== null;

  for (const refund of order?.refunds || []) {
    if (refund.status === 'FAILED' || refund.status === 'CANCELED') continue;
    const amount = moneyToMinor(refund.amount, fractionDigits);
    if (amount === null) {
      valid = false;
    } else if (refund.status === 'SUCCEEDED') {
      succeeded += amount;
    } else {
      pending += amount;
    }
  }

  // A refund response can arrive before the webhook updates the order aggregate.
  const refunded = Math.max(recordedRefunded ?? 0, succeeded);
  valid = valid && Number.isSafeInteger(succeeded) && Number.isSafeInteger(pending);
  return {
    paid: paid ?? 0,
    refunded,
    pending,
    available: valid ? Math.max(0, (paid ?? 0) - refunded - pending) : 0
  };
};

export const refundAmountError = (amount: string, available: number, fractionDigits: number) => {
  const minor = moneyToMinor(amount, fractionDigits);
  if (minor === null || minor <= 0) return 'refundAmountInvalid';
  if (minor > available) return 'refundAmountExceeds';
  return undefined;
};
