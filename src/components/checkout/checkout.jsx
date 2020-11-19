import React, { useContext, useState } from 'react';
import { CartContext } from '../../context/cart-context';
import Layout from '../shared/layout';
import ShippingAddress from './custom-checkout/shipping-address';
import CustomCheckout from './custom-checkout/custom-checkout';
import './checkout.styles.scss';

const Checkout = () => {
  const { itemCount, total, cartItems } = useContext(CartContext);
  const [shipping, setShipping] = useState(null);
  const addressShown = {
    display: (shipping ? 'none' : 'block')
  }
  const cardShown = {
    display: (shipping ? 'block' : 'none')
  }
  return (
    <Layout>
      <div className='checkout'>
        <h2>Checkout Summary</h2>
        <h3>{`Total Items: ${itemCount}`}</h3>
        <h4>{`Amount to Pay: $${total}`}</h4>
        <div style={addressShown}>
          <ShippingAddress setShipping={setShipping} />
        </div>
        <div style={cardShown}>
          <CustomCheckout { ...{ shipping, cartItems } }/>
        </div>
      </div>
    </Layout>
  );
}

export default Checkout;