import { insertProductSchema, insertCartSchema, cartItemSchema, shippingAddressSchema, insertOrderItemSchema, insertOrderSchema, paymentResultsSchema } from "@/lib/validators";
import { z } from "zod";

export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: number;
  createdAt: Date;
}


export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export type OrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = z.infer<typeof insertOrderSchema> & {
  id:string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderitems: OrderItem[];
  user: {name:string; email:string|null}
}

export type PaymentResult = z.infer<typeof paymentResultsSchema>