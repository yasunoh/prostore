import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { UpdateOrderToPaid } from "@/lib/actions/order.actions";

export async function POST(req: NextRequest) {
  // Build the webhook event
  const event = await Stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get('stripe-signature') as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  )

  // Check for successful payment
  if(event.type === 'charge.succeeded') {
    // paymentIntent
    const { object } = event.data;

    // Update order status
    await UpdateOrderToPaid({
      orderId: object.metadata.orderId,
      paymentResult: {
        id: object.id,
        status: 'COMPLETED',
        email_address: object.billing_details.email!,
        pricePaid: (object.amount / 100).toFixed(2),
      }
    });

    return NextResponse.json({
      message: 'updateOrderToPaid was successfull'
    });
  }

  return NextResponse.json({
    message: 'event is not charge.succeeded'
  })
}