import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { UserContext } from '../../../context/user-context';
import { fetchFromAPI } from '../../../helpers';

const CustomCheckout = ({ shipping, cartItems, history: { push } }) => {
  const { user } = useContext(UserContext);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClienSecret] = useState(null);
  const [cards, setCards] = useState(null);
  const [payment, setPaymentCard] = useState('');
  const [saveCard, setSavedCard] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const items = cartItems.map(item => ({price: item.price, quantity: item.quantity}));
    if (user) {
      const savedCards = async () => {
        try {
          const cardsList = await fetchFromAPI('get-payment-methods', {
            method: 'GET',
          }); 
          setCards(cardsList);
        } catch(error) {
          console.log(error);
        }
      }
      savedCards();
    }

    if (shipping) {
      const body = {
        cartItems: items,
        shipping: {
          name: shipping.name,
          address: {
            line1: shipping.address
          }
        },
        description: 'payment intent for nomad shop',
        receipt_email: shipping.email,
      }

      const customCheckout = async () => {
        const { clientSecret, id } = await fetchFromAPI('create-payment-intent', {
          body
        });

        setClienSecret(clientSecret)
        setPaymentIntentId(id);
      }

      customCheckout();
    }
  }, [shipping, cartItems, user]);

  const handleCheckout = async () => {
    setProcessing(true);
    let si;
    // check if user has selcted to save card
    if (saveCard) {
      // make to create a setup intent 
      si = await fetchFromAPI('save-payment-method');
    }
    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement)
      }
    });

    if (payload.error) {
      setError(`Payment Failed: ${payload.error.message}`);
    } else {
      if (saveCard && si) {
        // send the customers card details to be saved with stripe
        await stripe.confirmCardSetup(si.client_secret, {
          payment_method: {
            card: elements.getElement(CardNumberElement)
          }
        }); 
        push('/success');
      } else {
        push('/success');
      }
    }
  }

  const savedCardCheckout = async () => {
    setProcessing(true);
    // update the payment intent to incude the customer parameter
    const { clientSecret } = await fetchFromAPI('update-payment-intent', {
      body: { paymentIntentId }, method: 'PUT',
    });

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: payment,
    });

    if (payload.error) {
      setError(`Payment Failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      push('/success');
    }
  }

  const cardHandleChange = event => {
    const { error } = event;
    setError(error ? error.message: '');
  }

  const cardStyle = {
    style: {
      base: {
        color: "#000",
        fontFamily: 'Roboto, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#606060",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    }
  };

  let cardOption;

  if (cards) {
    cardOption = cards.map(card => {
      const { card: { brand, last4, exp_month, exp_year } } = card;
      return (
        <option key={card.id} value={card.id}>
          { `${brand}/ **** **** **** ${last4} ${exp_month}/${exp_year}` }
        </option>
      );
    });
    cardOption.unshift(
      <option key='Select a card' value=''>Select A Card</option>
    );
  }

  return (
    <div>
      {
        user && (cards && cards.length > 0) &&
        <div>
          <h4>Pay with saved card</h4>
          <select value={payment} onChange={e => setPaymentCard(e.target.value)}>
            { cardOption }
          </select>
          <button
            type='submit'
            disabled={processing || !payment}
            className='button is-black nomad-btn submit saved-card-btn'
            onClick={() => savedCardCheckout()}
          >
          { processing ? 'PROCESSING' : 'PAY WITH SAVED CARD' }
          </button>
        </div>
      }
      <h4>Enter Payment Details</h4>
      <div className='stripe-card'>
        <CardNumberElement 
          className='card-element'
          options={cardStyle}
          onChange={cardHandleChange}
        />
      </div>
      <div className='stripe-card'>
        <CardExpiryElement 
          className='card-element'
          options={cardStyle}
          onChange={cardHandleChange}
        />
      </div>
      <div className='stripe-card'>
        <CardCvcElement 
          className='card-element'
          options={cardStyle}
          onChange={cardHandleChange}
        />
      </div>
      {
        user &&
        <div className='save-card'>
          <label>Save Card</label>
          <input 
            type='checkbox'
            checked={saveCard}
            onChange={e => setSavedCard(e.target.checked)}
          />
        </div>
      }
      <div className='submit-btn'>
        <button
          disabled={processing}
          className='button is-black nomad-btn submit'
          onClick={() => handleCheckout()}
        >
          { processing ? 'PROCESSING' : 'PAY' }
        </button>
      </div>
      {
        error && (<p className='error-message'>{error}</p>)
      }
    </div>
  );
}

export default withRouter(CustomCheckout);