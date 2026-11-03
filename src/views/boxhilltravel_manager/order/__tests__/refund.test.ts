import { describe, expect, it } from 'vitest';
import type { OrderRefundVO, OrderVO } from '@/api/boxhilltravel_manager/order/types';
import { getRefundBalance, minorToAmount, moneyToMinor, refundAmountError } from '../refund';

const refund = (amount: string, status: OrderRefundVO['status']): OrderRefundVO => ({
  id: `${status}-${amount}`,
  orderId: 1,
  amount,
  currency: 'usd',
  status,
  reason: 'Customer request'
});
const order = (overrides: Partial<OrderVO> = {}): OrderVO =>
  ({
    paidAmount: '100.00',
    refundedAmount: '0.00',
    refunds: [],
    ...overrides
  }) as OrderVO;

describe('refund currency precision', () => {
  it('handles decimal amounts without floating point rounding', () => {
    expect(moneyToMinor('0.29', 2)).toBe(29);
    expect(moneyToMinor('100.10', 2)).toBe(10010);
    expect(moneyToMinor('1.234', 3)).toBe(1234);
    expect(moneyToMinor('100.00', 0)).toBe(100);
  });

  it('preserves the exact decimal amount when converting back for submission', () => {
    expect(minorToAmount(29, 2)).toBe('0.29');
    expect(minorToAmount(100, 0)).toBe('100');
    expect(minorToAmount(1, 3)).toBe('0.001');
    expect(minorToAmount(Number.MAX_SAFE_INTEGER, 2)).toBe('90071992547409.91');
  });

  it.each(['-1', '1e2', 'NaN', 'Infinity', '', '1.001', '9007199254740992'])(
    'rejects invalid or unsafe amount %s',
    amount => {
      expect(moneyToMinor(amount, 2)).toBeNull();
    }
  );

  it('validates the refundable limit and currency decimal places', () => {
    expect(refundAmountError('0', 1000, 2)).toBe('refundAmountInvalid');
    expect(refundAmountError('10.01', 1000, 2)).toBe('refundAmountExceeds');
    expect(refundAmountError('10.00', 1000, 2)).toBeUndefined();
    expect(refundAmountError('100.1', 200, 0)).toBe('refundAmountInvalid');
  });
});

describe('refund balance', () => {
  it('does not count successful refunds twice after a webhook updates the order', () => {
    expect(getRefundBalance(order({ refundedAmount: '20.00', refunds: [refund('20.00', 'SUCCEEDED')] }), 2)).toEqual({
      paid: 10000,
      refunded: 2000,
      pending: 0,
      available: 8000
    });
  });

  it('reserves successful and pending refunds before the order aggregate is updated', () => {
    const result = getRefundBalance(order({ refunds: [refund('20.00', 'SUCCEEDED'), refund('30.00', 'PENDING')] }), 2);
    expect(result).toEqual({ paid: 10000, refunded: 2000, pending: 3000, available: 5000 });
  });

  it('does not reserve failed or canceled refunds', () => {
    expect(
      getRefundBalance(order({ refunds: [refund('20.00', 'FAILED'), refund('30.00', 'CANCELED')] }), 2).available
    ).toBe(10000);
  });

  it('keeps the recorded refund total when records are incomplete', () => {
    expect(
      getRefundBalance(order({ refundedAmount: '50.00', refunds: [refund('20.00', 'SUCCEEDED')] }), 2).available
    ).toBe(5000);
  });

  it('blocks refunds when balances are invalid or exhausted', () => {
    expect(getRefundBalance(order({ paidAmount: 'invalid' }), 2).available).toBe(0);
    expect(getRefundBalance(order({ refunds: [refund('1.001', 'PENDING')] }), 2).available).toBe(0);
    expect(
      getRefundBalance(order({ refundedAmount: '100.00', refunds: [refund('20.00', 'PENDING')] }), 2).available
    ).toBe(0);
    expect(getRefundBalance(undefined, 2).available).toBe(0);
  });
});
