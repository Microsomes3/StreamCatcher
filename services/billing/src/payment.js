const stripe = require('stripe')(process.env.STRIPE_SECRET, {
    apiVersion: '2020-08-27'
})

module.exports.handler = async (event) => {

    const { amount, currency } = JSON.parse(event.body);

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency,
            automatic_payment_methods: {
                enabled: true
            }
        })

        return {
            statusCode: 200,
            body: JSON.stringify({
                clientSecret: paymentIntent.client_secret
            }),
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            }
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: err.message,
                amount,
                currency
            })
        }
    }
}