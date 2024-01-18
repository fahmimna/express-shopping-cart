import express from 'express'
import products from './product-data.js'

const app = express()
app.use(express.json())

const shoppingCart = {
  items: [],
  totalPrice: 0,
  totalItems: 0
}

const orders = []

app.get('/products', (req, res) => {
  res.json(products)
})

app.get('/shopping-cart', (req, res) => {
  res.json(shoppingCart)
})

app.post('/shopping-cart', (req, res) => {
  const productId = req.body.productId
  const quantity = Number(req.body.quantity)

  if (!productId || !quantity) {
    res.status(422).json({
      message: 'productId and quantity are required'
    })
  }

  const product = products.find((product) => product.id === productId)

  if (!product) {
    res.status(404).json({
      message: 'Product not found'
    })
    return
  }

  if (!product.inStock) {
    res.status(422).json({
      message: 'Product is out of stock'
    })
    return
  }

  // Check if product is already in shopping cart
  const itemIndex = shoppingCart.items.findIndex((item) => item.product.id === productId)

  if (itemIndex > -1) {
    shoppingCart.items[itemIndex].quantity += quantity
    recalculateTotals()

    res.json({
      message: 'Product quantity updated'
    })
    return
  }

  shoppingCart.items.push({ product, quantity })
  recalculateTotals()

  res.json({
    message: 'Product added to shopping cart'
  })
})

app.delete('/shopping-cart/:index', (req, res) => {
  shoppingCart.items.splice(req.params.index, 1)
  recalculateTotals()

  res.json({
    message: 'Product removed from shopping cart'
  })
})

app.post('/checkout', (req, res) => {
  // Check if shopping cart is empty
  if (shoppingCart.items.length === 0) {
    res.status(422).json({
      message: 'Shopping cart is empty'
    })
    return
  }

  // Add shopping cart to orders
  orders.push({
    ...shoppingCart,
    date: new Date()
  })

  resetShoppingCart()

  res.json({
    message: 'Checkout successful'
  })
})

app.get('/orders', (req, res) => {
  res.json(orders)
})

const recalculateTotals = () => {
  // Calculate total price
  const totalPrice = shoppingCart.items.reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)

  shoppingCart.totalPrice = totalPrice.toFixed(2)

  // Calculate total items
  shoppingCart.totalItems = shoppingCart.items.length
}

const resetShoppingCart = () => {
  shoppingCart.items = []
  recalculateTotals()
}

export default app
