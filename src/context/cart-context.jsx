import React, { createContext, useReducer } from 'react';
import cartReducer, { sumItems } from './cart-reducer';

export const CartContext = createContext();

const cartFromStorage = localStorage.getItem('cart') ? 
  JSON.parse(localStorage.getItem('cart')) : [];

const initialState = { cartItems: cartFromStorage, ...sumItems(cartFromStorage) };

const CartContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const addProduct = (product) => dispatch({ type: 'ADD_ITEM', payload: product });
  const increase = (product) => dispatch({type: 'INCREASE', payload: product});
  const decrease = (product) => dispatch({ type: 'DECREASE', payload: product });
  const removeProduct = (product) => dispatch({ type:'REMOVE_ITEM', payload: product });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  const contextValues = {
    ...state,
    addProduct,
    increase,
    decrease,
    removeProduct,
    clearCart,
  }

  return (
    <CartContext.Provider value={ contextValues }>
      {
        children
      }
    </CartContext.Provider>
  );
}

export default CartContextProvider;