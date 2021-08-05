/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51I9ZjlBcVHcNRhZkS6AjIVbFJjCfczEIlX936bl0ZMVfqZheO6m2x66gI0VIramnHRsAVEUU3OfeWp5exeRLIWUQ00uusNH9Dd'
  );

  try {
    // console.log(tourId);
    // 1) get the checkout session from the API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(`SESSION: ${session}`);

    // 2) create checkout form + credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
