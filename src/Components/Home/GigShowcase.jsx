import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import './GigShowcase.scss'
const gigs = [
    {
        id: 1,
        title: "I will design a modern logo",
        seller: "Alex D.",
        rating: 4.9,
        reviews: 120,
        price: 50,
        image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600&h=300&fit=crop",
    },
    {
        id: 2,
        title: "I will develop your MERN stack app",
        seller: "Sofia P.",
        rating: 5.0,
        reviews: 98,
        price: 200,
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=300&fit=crop",
    },
    {
        id: 3,
        title: "I will create a stunning portfolio website",
        seller: "David R.",
        rating: 4.8,
        reviews: 150,
        price: 120,
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop",
    },
];

const transitionVariants = {
    initial: {
        x: '100%',
        opacity: 2,
        zIndex: 3
    },
    animate: {
        x: 0,
        opacity: 2,
        zIndex: 1
    },
    exit: {
        x: 0,
        opacity: 1,
        zIndex: 0
    }
}

export default function GigShowcase() {

    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % gigs.length)
        }, 4000);

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <div className="gig-showcase-container">
                <div className="gig-showcase-title-container">
                    <div className="gig-showcase-title">
                        Gig Highlights
                    </div>
                </div>
                <div className="gig-card-showcase">
                    <AnimatePresence initial={false}>
                        <motion.div key={gigs[index].id} variants={transitionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 2, ease: "easeOut" }} className="gig-showcase">
                            <img src={gigs[index].image} alt={gigs[index].title} />
                            <div key={gigs[index].id} className="gig-card-details-overlay">
                                <h3>{gigs[index].title}</h3>
                                <p>by {gigs[index].seller} ⭐ {gigs[index].rating} <br /> {gigs[index].reviews} ratings</p>
                                <p className='gig-pricing'>Starting at {gigs[index].price}$</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
                {/* <div className="dots">
                    {gigs.map((_, i) => (
                        <span key={i} className={`dot ${i === index ? 'active' : ''}`}/>
                    ))}
                </div> */}
            </div>
        </>
    )
}