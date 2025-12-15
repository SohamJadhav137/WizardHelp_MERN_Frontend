import React, { useState } from 'react'
import Slider from 'react-slick'
import { gigCat } from '../../Data/GigCat.js';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './SliderWindow.scss';
import { useNavigate } from 'react-router-dom';


export default function SliderWindow() {
    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1
    }
    
    const navigate = useNavigate();

    return (
        <div id="slider-container">
            <div className="slider">
                <Slider {...settings}>
                    {
                        gigCat.map((cat, index) => (
                            <div key={index} className="slider-gig-card" onClick={() => navigate(`/category/${(cat.name)}`)}>
                                <div className="gig-card-img">
                                    <img src={cat.image} alt="Gig" />
                                    <div className="gig-card-title">{cat.name}</div>
                                </div>
                            </div>
                        ))
                    }
                </Slider>
            </div>
        </div>
    )
}