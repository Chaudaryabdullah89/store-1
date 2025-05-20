import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../Context/shopcontext'
import Title from './Title'
import ProductItem from './productitem'

const Bestseller = () => {

    const {products} = useContext(ShopContext)
const [bestseller, setBestseller] = useState([])    

useEffect(() => {
const bestseller = products.filter(product => product.bestseller === true)
    setBestseller(bestseller)
},[products])

  return (
    <div className='my-10'>
        <div className='text-center text-3xl py-8 '> 

            <Title  text1={'Best' } text2={'Seller'} />
            <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, pariatur.
            </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
{
    bestseller.map((item, index) => (

        <ProductItem key={index} id={item._id} name={item.name} price={item.price} image={item.image[0]} />
    ))

}

        </div>
    </div>
  )
}

export default Bestseller