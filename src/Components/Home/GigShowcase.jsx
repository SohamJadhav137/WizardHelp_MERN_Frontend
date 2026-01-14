import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import './GigShowcase.scss'
import { Rating } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
// const gigs = [
//     {
//         id: 1,
//         title: "I will design a modern logo",
//         seller: "Alex D.",
//         rating: 4.9,
//         reviews: 120,
//         price: 50,
//         image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600&h=300&fit=crop",
//     },
//     {
//         id: 2,
//         title: "I will develop your MERN stack app",
//         seller: "Sofia P.",
//         rating: 5.0,
//         reviews: 98,
//         price: 200,
//         image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=300&fit=crop",
//     },
//     {
//         id: 3,
//         title: "I will create a stunning portfolio website",
//         seller: "David R.",
//         rating: 4.8,
//         reviews: 150,
//         price: 120,
//         image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop",
//     },
// ];

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

    const [gigs, setGigs] = useState([]);
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false)

    const navigate = useNavigate();

    // Fetch best gigs
    useEffect(() => {
        const fetchBestGigs = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/gigs/best-by-category');

                if (res.ok) {
                    const data = await res.json();
                    const formattedData = data.map(item => ({
                        id: item.gig._id,
                        title: item.gig.title,
                        sellerId: item.gig.userId,
                        seller: item.gig.sellerName,
                        rating: item.gig.starRating,
                        reviews: item.gig.totalReviews,
                        price: item.gig.price,
                        image: item.gig.coverImageURL,
                        category: item.gig.category,
                    }));

                    setGigs(formattedData);
                }
                else {
                    console.error("Failed to fetch best gigs:", res.status);
                }
            } catch (error) {
                console.error("Some error occured while retrieving gigs:", error)
            }
        };

        fetchBestGigs();
    }, []);

    // console.log("GIGS:\n", gigs);

    // Iterating gigs at regular intervals
    useEffect(() => {
        if (!gigs.length || isPaused) return;

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % gigs.length)
        }, 4000);

        return () => clearInterval(interval)
    }, [gigs, isPaused]);

    return (
        <>
            <div className="gig-showcase-container">
                <div className="gig-showcase-title-container">
                    <div className="gig-showcase-title">
                        Best Performing Gigs
                    </div>
                </div>
                <div className="gig-card-showcase" onMouseEnter={() =>setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
                    {
                        gigs.length > 0 && (
                            <AnimatePresence initial={false}>
                                <motion.div onClick={() => navigate(`/gig/${gigs[index].id}`)} key={gigs[index].id} variants={transitionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 2, ease: "easeOut" }} className="gig-showcase">
                                    <img src={gigs[index].image} alt={gigs[index].title} />
                                    <div key={gigs[index].id} className="gig-card-details-overlay">
                                        <div className="gig-category">
                                            {gigs[index].category}
                                        </div>

                                        <div>
                                            <div className="gig-details">
                                                <h3>{gigs[index].title}</h3>
                                                <div className='star-rating'>
                                                    {
                                                        gigs[index].rating !==0 ?
                                                        <>
                                                        {gigs[index].rating} <Rating name="read-only" value={gigs[index].rating} readOnly /> ({gigs[index].reviews})
                                                        </>
                                                        :
                                                        'NEW!'
                                                    }
                                                </div>
                                                <div className='gig-pricing'>Starting at ₹{gigs[index].price}</div>
                                            </div>

                                            <div className="gig-creator">
                                                <Link className='link' to={`/user/${gigs[index].sellerId}`} onClick={(e) => e.stopPropagation()}>
                                                <span className='creator-label'>By:</span> <span className='creator-name'>{gigs[index].seller}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )
                    }
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