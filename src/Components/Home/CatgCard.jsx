import React from 'react'
import { Link } from 'react-router-dom'

import './CatgCard.scss'

export default function CatgCard({item}) {
  return (
    <Link to='/gigs?cat=design'>
    <div className="catg-card">
      <img src={item.img} alt="" />
      <span className='title'>{item.title}</span>
      <span className='desc'>{item.desc}</span>
    </div>
    </Link>
  )
}
