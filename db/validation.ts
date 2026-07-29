import { Type, type Static } from "@sinclair/typebox";

const uuid = Type.String({ format: "uuid" });
const decimalAmount = Type.String({ pattern: "^[0-9]+(\\.[0-9]{1,6})?$" });
const settlementCurrency = Type.Union([
  Type.Literal("usdc"),
  Type.Literal("eurc"),
]);

export const createShipmentBodySchema = Type.Object({
  shipperId: uuid,
  freightForwarderId: uuid,
  origin: Type.String({ minLength: 1, maxLength: 160 }),
  destination: Type.String({ minLength: 1, maxLength: 160 }),
  fundedAmount: Type.Optional(decimalAmount),
  fundedCurrency: Type.Optional(settlementCurrency),
});

export type CreateShipmentBody = Static<typeof createShipmentBodySchema>;

export const createShipmentParticipantBodySchema = Type.Object({
  logisticsPartnerId: uuid,
  serviceType: Type.String({ minLength: 1, maxLength: 100 }),
});

export type CreateShipmentParticipantBody = Static<
  typeof createShipmentParticipantBodySchema
>;

export const createPaymentObligationBodySchema = Type.Object({
  shipmentParticipantId: uuid,
  amount: decimalAmount,
  currency: settlementCurrency,
  milestone: Type.String({ minLength: 1, maxLength: 160 }),
  dueAt: Type.Optional(Type.String({ format: "date-time" })),
  financingEligible: Type.Optional(Type.Boolean()),
});

export type CreatePaymentObligationBody = Static<
  typeof createPaymentObligationBodySchema
>;
