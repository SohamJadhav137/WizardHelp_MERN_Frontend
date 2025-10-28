import React from 'react'

import Slider from 'infinite-react-carousel';
import './SliderWindow.scss'

export default function SliderWindow({children,autoplay,autoplaySpeed,pauseOnHover,slidesToShow,arrowsScroll}) {
    return (
        <div className="slider">
            <div className="container">
                <Slider autoplay={autoplay} autoplaySpeed={autoplaySpeed} pauseOnHover={pauseOnHover} slidesToShow={slidesToShow} arrowsScroll={arrowsScroll}>
                    {children}
                </Slider>
            </div>
        </div>
    )
}
