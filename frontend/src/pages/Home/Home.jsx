import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import Banner from '../../components/Banner/Banner'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {

    const [category, setCategory] = useState("All")

  return (
    <div>
      <Header/>
      <Banner/>
      
      {/* Welcome Message */}
      <div className="welcome-message">
        <div className="welcome-container">
          <h1>Welcome to Oud Restaurant</h1>
          <p>Discover our delicious menu featuring fresh ingredients and authentic flavors. From savory salads to mouthwatering desserts, we have something for everyone.</p>
          <div className="welcome-features">
            <div className="feature">
              <span>🍽️</span>
              <p>Fresh Ingredients</p>
            </div>
            <div className="feature">
              <span>🚚</span>
              <p>Fast Delivery</p>
            </div>
            <div className="feature">
              <span>⭐</span>
              <p>Quality Service</p>
            </div>
          </div>
        </div>
      </div>
      
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category}/>
      <AppDownload/>
    </div>
  )
}

export default Home
