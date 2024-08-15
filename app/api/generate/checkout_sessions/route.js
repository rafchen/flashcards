import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe[process.env.STRIPE_SECRET_KEY]
export async function POST(req) {
    const params = {
    submit_type: 'subscription',
    payment_method_types:['cards']
    line_items: [
        {
            price_data={
                currency: 'usd',
                product_data: {
                    name:'Pro Subscription',
                }
            }
        },
    ],
    }

}
 