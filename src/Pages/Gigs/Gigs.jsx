import React, { useEffect, useState } from 'react'

import { Link, useLocation, useParams } from 'react-router-dom';

import './Gigs.scss';
import GigCard from '../../Components/Gigs/GigCard';
import { gigs } from '../../Data/GigsData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


export default function Gigs() {

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { categoryName } = useParams();
  const category = categoryName;
  const [activeButton, setActiveButton] = useState("best-selling");

  // Filter gigs
  const sortAscend = () => {
    const copyArray = [...gigs]

    copyArray.sort((a, b) => a.price - b.price)
    setGigs(copyArray)
    setActiveButton("ascend")
  }

  const sortDescend = () => {
    const copyArray = [...gigs]

    copyArray.sort((a, b) => b.price - a.price)
    setGigs(copyArray)
    setActiveButton("descend")
  }

  const orderBestSelling = () => {
    const copyArray = [...gigs]

    copyArray.sort((a, b) => b.orders - a.orders)
    setGigs(copyArray)
    setActiveButton("best-selling")
  }

  const orderRating = () => {
    const copyArray = [...gigs]

    copyArray.sort((a, b) => b.starRating - a.starRating)
    setGigs(copyArray)
    setActiveButton("rating")
  }

  // Fetch category wise gigs
  useEffect(() => {
    const fetchCatGigs = async (category) => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/category/${category}`);
        const data = await response.json();
        setGigs([...data].sort((a, b) => b.orders - a.orders));
      } catch (error) {
        console.error("Some error occured while fetching gigs category wise:", error);
      }
      setLoading(false);
    };

    fetchCatGigs(category);
  }, [category]);

  return (
    <div className='gigs-main'>

      <div className="breadcrump">
        <div className="breadcrump-container">
          <Link to='/'>Home</Link><FontAwesomeIcon icon="fa-solid fa-angle-left" /><Link to={`/category/${category}`}>{category}</Link>
        </div>
      </div>

      <div className="category-heading">
        <div className="category-heading-container">
          {category}
        </div>
      </div>

      {
        gigs.length !== 0 &&
        <div className="sort-options">
          <div className="sort-options-container">
            <span>Sort By:</span>
            <button className={activeButton === 'best-selling' ? 'active' : ''} onClick={orderBestSelling}>Best Selling</button>
            <button className={activeButton === 'descend' ? 'active' : ''} onClick={sortDescend}>Price (High to Low)</button>
            <button className={activeButton === 'ascend' ? 'active' : ''} onClick={sortAscend}>Price (Low to High)</button>
            <button className={activeButton === 'rating' ? 'active' : ''} onClick={orderRating}>Rating</button>
          </div>
        </div>
      }
      <div className={gigs.length !== 0 ? 'gigs' : 'gigs empty'}>
        <div className="gigs-container">
          {
            loading ? (
              <p>Loading gigs...</p>
            )
              :

              gigs.length === 0 ?
                <div className="gigs-empty-space">
                  <div className="no-data-found-gif-container">
                    {/* <img src="/no_data_found.gif" alt="" /> */}
                    <div className="no-data-found-gif">
                      <DotLottieReact
                        src="https://lottie.host/c53dd459-03d1-4a08-84a6-4a409242d14f/yAUDLZG2Vm.lottie"
                        loop
                        autoplay
                      />
                    </div>
                  </div>
                  <div className="no-data-found-text">
                    No gigs available at the moment...
                  </div>
                </div>
                :
                gigs.map((gig) => (
                  <GigCard key={gig._id} gig={gig} />
                ))
          }
        </div>
      </div>
    </div>
  )
}
