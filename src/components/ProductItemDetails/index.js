// Write your code here
import {Component} from 'react'
import {Redirect} from 'react-router-dom'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'

import Header from '../Header'
import ProductCard from '../ProductCard'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    productDetails: {},
    similarProductList: [],
    quantity: 1,
    fetchStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getProductDetails()
  }

  getUpdatedData = data => ({
    availability: data.availability,
    brand: data.brand,
    description: data.description,
    id: data.id,
    imageUrl: data.image_url,
    price: data.price,
    rating: data.rating,
    style: data.style,
    title: data.title,
    totalReviews: data.total_reviews,
  })

  getProductDetails = async () => {
    this.setState({fetchStatus: apiStatusConstants.inProgress})
    const {match} = this.props
    const {params} = match
    const {id} = params
    const jwtToken = Cookies.get('jwt_token')
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const apiUrl = `https://apis.ccbp.in/products/${id}`

    const response = await fetch(apiUrl, options)
    const fetchData = await response.json()
    const updatedData = this.getUpdatedData(fetchData)
    const updatedSimilarData = fetchData.similar_products.map(each =>
      this.getUpdatedData(each),
    )

    if (response.ok) {
      this.setState({
        productDetails: updatedData,
        similarProductList: updatedSimilarData,
        fetchStatus: apiStatusConstants.success,
      })
    }
    if (response.status === 404) {
      this.setState({fetchStatus: apiStatusConstants.failure})
    }
  }

  onIncrement = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  onDecrement = () => {
    const {quantity} = this.state

    if (quantity > 1) {
      this.setState(prevState => ({quantity: prevState.quantity - 1}))
    }
  }

  onClickBackToShoping = () => <Redirect to="/products" />

  renderFailureView = () => (
    <div className="no-products-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        className="no-products-img"
        alt="failure view"
      />
      <h1 className="no-products-heading">No Products Found</h1>
      <button
        type="button"
        className="continue-shop-btn"
        onClick={this.onClickBackToShoping}
      >
        Continue Shopping
      </button>
    </div>
  )

  onSuccessApi = () => {
    const {productDetails, quantity, similarProductList} = this.state

    const {
      imageUrl,
      availability,
      brand,
      description,
      price,
      rating,
      title,
      totalReviews,
    } = productDetails
    return (
      <div>
        <div className="product-details-container">
          <img src={imageUrl} alt="product" className="product-details-image" />
          <div className="product-specs-container">
            <h1 className="title">{title}</h1>
            <p className="price">Rs {price}/-</p>
            <div className="rating-views-container">
              <div className="rating-container">
                <p className="rating-text">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png "
                  alt="star"
                  className="start"
                />
              </div>
              <p className="review">{totalReviews} Reviews</p>
            </div>
            <p className="description">{description}</p>
            <div className="small-container">
              <p className="before-text">Availble:</p>
              <p className="after-text">{availability}</p>
            </div>
            <div className="small-container">
              <p className="before-text">Brand:</p>
              <p className="after-text">{brand}</p>
            </div>
            <hr className="brake-line" />
            <div className="qty-container">
              <button
                type="button"
                className="qty-btn"
                onClick={this.onDecrement}
                data-testid="minus"
              >
                <BsDashSquare className="icon" />
              </button>
              <p className="quantity">{quantity}</p>
              <button
                type="button"
                className="qty-btn"
                onClick={this.onIncrement}
                data-testid="plus"
              >
                <BsPlusSquare className="icon" />
              </button>
            </div>
            <button type="button" className="add-to-cart-btn">
              ADD TO CART
            </button>
          </div>
        </div>
        <div>
          <h1 className="similar-products-heading">Similar Products</h1>
          <ul className="similar-product-list-container">
            {similarProductList.map(each => (
              <ProductCard productData={each} key={each.id} />
            ))}
          </ul>
        </div>
      </div>
    )
  }

  renderLoader = () => (
    <div data-testid="loader" className="products-loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderProductCart = () => {
    const {fetchStatus} = this.state

    switch (fetchStatus) {
      case 'SUCCESS':
        return this.onSuccessApi()
      case 'FAILURE':
        return this.renderFailureView()
      default:
        return this.renderLoader()
    }
  }

  render() {
    return (
      <div>
        <Header />
        {this.renderProductCart()}
      </div>
    )
  }
}

export default ProductItemDetails
