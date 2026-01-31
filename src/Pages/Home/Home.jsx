import React, { useEffect } from 'react'

import './Home.scss'
import SliderWindow from '../../Components/Home/SliderWindow'
import CatgCard from '../../Components/Home/CatgCard'
import { cards } from '../../data'
import analytics_img from '../../assets/analytics.png'
import curate_img from '../../assets/content-curation.png'
import mil_img from '../../assets/milestone.png'
import secure_pic from '../../assets/secure_pic.png'
import options_pic from '../../assets/options_pic.png'
import personalization_pic from '../../assets/personalization_pic.png'
import deliver_pic from '../../assets/deliver_pic.png'
import GigShowcase from '../../Components/Home/GigShowcase'
import { useLocation } from 'react-router-dom'

export default function Home() {

  const location = useLocation();

  // Scroll to category slider after being redirected from other page
  useEffect(() => {
    if(location.state?.scrollTo === 'slider-container'){
      const section = document.getElementById('slider-container');
      section?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.state]);

  return (
    <>
    {/****************************************** FLYER SECTION ********************************************/}
    <div className="dark">
      <div className='flyer'>
        <div className="container">
          <div className="text">
            <h1>Turn your ideas into reality<br />with <span className='style-word'>creative wizards</span></h1>
          </div>
        </div>
        <video src="/home_bg.mp4" autoPlay loop muted playsInline></video>
      </div>

    {/****************************************** CATEGORIES SECTION ********************************************/}
    
    <SliderWindow/>
    </div>

    {/****************************************** FEATURES SECTION ********************************************/}
      <div className="container2">

        <div className="features-title-container">
          <div className="features-title">
            Key Features
          </div>
        </div>

        <div className="features">
          <div className="f1">
            <img src={analytics_img} alt="image" />
            <div className="title">AI Analytics</div>
            <div className="desc">Gain smart insights to grow your gigs with real-time performance analytics</div>
          </div>
          <div className="f2">
            <img src={mil_img} alt="image" />
            <div className="title">Milestone Based</div>
            <div className="desc">Break projects into clear milestones for smoother collaboration and delivery</div>
          </div>
          <div className="f3">
            <img src={curate_img} alt="image" />
            <div className="title">Curated Sellers</div>
            <div className="desc">Work with handpicked creators, ensuring top-quality results every time</div>
          </div>
          <div className="f4">
            <img src={secure_pic} alt="image" />
            <div className="title">Safe & Transparent Payments</div>
            <div className="desc">Enjoy secure transactions with clear, upfront pricing and no hidden fees</div>
          </div>
        </div>
      </div>

      {/****************************************** HOW IT WORKS SECTION ********************************************/}

      <div className="container3">
        <div className="features-title-container">
          <div className="features-title">
            How it works ?
          </div>
        </div>
        <div className="sub-container">
          <div className="c">
            <div className="step">
              <img src={options_pic} alt="image" />
              <span className='title'>Step-1: <br />Choose what you need</span>
              <br />
              <span className='desc'>Pick a service category, style, and budget that fits your project.</span>
            </div>
            <div className="step">
              <img src={personalization_pic} alt="image" />
              <span className='title'>Step-2: <br />Browse Curated Wizards</span>
              <br />
              <span className='desc'>Find the right creators and place your order with confidence.</span>
            </div>
            <div className="step">
              <img src={deliver_pic} alt="image" />
              <span className='title'>Step-3: <br />Receive Your Delivery</span>
              <br />
              <span className='desc'>Get your finished project files and bring your idea to life.</span>
            </div>
          </div>
        </div>
      </div>

      {/****************************************** GIG SHOWCASE SECTION ********************************************/}
      <GigShowcase/>      
    </>
  )
}
