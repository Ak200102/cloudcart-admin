import React from 'react'
import { BiLoaderCircle } from "react-icons/bi";

const Loader = () => {
  return (
    <div className='text-orange-600 text-5xl py-40 w-full flex items-center justify-center flex-col'>
      <BiLoaderCircle className='animate-spin'/>
      <p className='text-lg text-black font-medium tracking-wide mt-1'>Loading...</p>
    </div>
  )
}

export default Loader
