import {Switch, Route } from 'react-router-dom';
import HomePage from './components/home-page';
import NotFound from './components/not-found';
import Shop from './components/pages/shop/shop';
import SingleProduct from './components/single-product/single-product';
import CartPage from './components/pages/cart-page/cart-page';
import './App.scss';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path='/' component={HomePage} />
        <Route path='/shop' component={Shop} />
        <Route path='/product/:id' component={SingleProduct} />
        <Route path='/cart' component={CartPage} />
        <Route path='*' component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;
