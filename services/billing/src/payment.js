
const stripe = require('stripe')(process.env.STRIPE_SECRET,{
    apiVersion: '2020-08-27'
})

module.exports.handler = async(event) => {

    const { amount =20 } = JSON.parse(event.body);


    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true
        }
    })

    return {
        statusCode: 200,
        body: JSON.stringify({
            clientSecret: paymentIntent.client_secret
        })
    }
}