import React, { useState } from 'react'

import { Link } from 'react-router-dom';

import './Gigs.scss';
import GigCard from '../../Components/Gigs/GigCard';
import {gigs} from '../../Data/GigsData';

export default function Gigs() {

  const [gigsArray, setGigsArray] = useState(gigs)
  const [activeButton, setActiveButton] = useState("best-selling")
  
  // console.log(gigsArray)
  
  const sortAscend = () => {
    const copyArray = [...gigsArray]

    copyArray.sort((a, b) => a.price - b.price)
    setGigsArray(copyArray)
    setActiveButton("ascend")
  }

  const sortDescend = () => {
    const copyArray = [...gigsArray]

    copyArray.sort((a, b) => b.price - a.price)
    setGigsArray(copyArray)
    setActiveButton("descend")
  }

  const orderBestSelling = () => {
    const copyArray = [...gigsArray]

    copyArray.sort((a, b) => b.reviews - a.reviews)
    setGigsArray(copyArray)
    setActiveButton("best-selling")
  }

  const orderRating = () => {
    const copyArray = [...gigsArray]

    copyArray.sort((a, b) => b.rating - a.rating)
    setGigsArray(copyArray)
    setActiveButton("rating")
  }
  return (
    <div className='gigs-main'>
      <div className="breadcrump">
        <div className="breadcrump-container">
          <span> <Link to='/'>Home</Link> &gt; <Link to='/'>Programming</Link></span>
        </div>
      </div>
      <div className="category-heading">
        <div className="category-heading-container">
          <h2>Software</h2>
        </div>
      </div>
      <div className="sort-options">
        <div className="sort-options-container">
          <span>Sort By:</span>
          <button className={activeButton === 'best-selling' ? 'active' : ''} onClick={orderBestSelling}>Best Selling</button>
          <button className={activeButton === 'descend' ? 'active' : ''} onClick={sortDescend}>Price (High to Low)</button>
          <button className={activeButton === 'ascend' ? 'active' : ''} onClick={sortAscend}>Price (Low to High)</button>
          <button className={activeButton === 'rating' ? 'active' : ''} onClick={orderRating}>Rating</button>
        </div>
      </div>
      <div className="gigs">
        <div className="gigs-container">
          {
            gigsArray.map((gig) => (
              <GigCard key={gig.id} gig={gig}/>
            ))
          }
        </div>
      </div>
    </div>
  )
}
