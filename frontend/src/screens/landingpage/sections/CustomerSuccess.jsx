import React from 'react'
import { Link } from 'react-router-dom'

const CustomerSuccess = () => {
    return (
        <>
            <div className="integrations">
                <div className="lg:container lg:mx-auto px-0 lg:px-20 py-20">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-0  p-6 w-full mx-auto text-black">
                        <div className="w-full md:w-[35%] text-4xl  lg:text-5xl md:p-4 text-left "> <h1>Customer success <span className='underline decoration-green-500'>case studies </span></h1></div>
                        <div className="w-full md:w-[40%] text-lg md:p-4 py-4 text-left"><p>Discover how businesses like yours transformed with our software. Real stories of growth, innovation, and success.</p></div>
                        <div className=" flex w-full md:w-[25%] md:justify-end"> <a href="#_" className="px-5 py-2.5 relative rounded-lg group font-medium bg-green-500 text-white inline-block">
                            <span className="absolute top-0 left-0 flex w-full h-0 mb-0 transition-all duration-200 ease-out transform rounded-lg translate-y-0 bg-gray-900 group-hover:h-full opacity-90"></span>
                            <span className="relative group-hover:text-white">View Stories</span>
                        </a></div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 p-4 w-full mx-auto">
                        <div className="w-full xl:w-1/3 bg-white rounded-lg py-6">
                            <div className=' justify-center text-gray-500 p-10 py-5'>
                                <p>I just had to take a moment to express my gratitude for the outstanding service they provided. Their complete assistance and efforts were truly remarkable</p>
                                <div className="flex justify-between items-center">
                                    <div className='mt-10'>
                                        <p className='font-bold text-black '>Fredrick Hill</p>
                                        <p>CO-Founder CEO</p>
                                    </div>
                                    <div>
                                        <img src="../../assets/images/review1.jpg" alt="" className='w-[70px] h-13 rounded-full' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full xl:w-1/3 bg-white rounded-lg py-6">
                            <div className=' justify-center text-gray-500 p-10 py-5'>
                                <p>I just had to take a moment to express my gratitude for the outstanding service they provided. Their complete assistance and efforts were truly remarkable</p>
                                <div className="flex justify-between items-center">
                                    <div className='mt-10'>
                                        <p className='font-bold text-black '>Fredrick Hill</p>
                                        <p>CO-Founder CEO</p>
                                    </div>
                                    <div>
                                        <img src="../../assets/images/review1.jpg" alt="" className='w-[70px] h-13 rounded-full' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full xl:w-1/3 bg-white rounded-lg py-6">
                            <div className=' justify-center text-gray-500 p-10 py-5' >
                                <p>I just had to take a moment to express my gratitude for the outstanding service they provided. Their complete assistance and efforts were truly remarkable</p>
                                <div className="flex justify-between items-center">
                                    <div className='mt-10'>
                                        <p className='font-bold text-black '>Fredrick Hill</p>
                                        <p>CO-Founder CEO</p>
                                    </div>
                                    <div>
                                        <img src="../../assets/images/review1.jpg" alt="" className='w-[70px] h-13 rounded-full' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 p-4 w-full mx-auto items-stretch ">
                        <div className="w-full xl:w-1/3 bg-white rounded-lg py-6">
                            <div className=' justify-center text-gray-500 p-10 py-5'>
                                <p>I just had to take a moment to express my gratitude for the outstanding service they provided. Their complete assistance and efforts were truly remarkable</p>
                                <div className="flex justify-between items-center">
                                    <div className='mt-10'>
                                        <p className='font-bold text-black '>Fredrick Hill</p>
                                        <p>CO-Founder CEO</p>
                                    </div>
                                    <div>
                                        <img src="../../assets/images/review1.jpg" alt="" className='w-[70px] h-13 rounded-full' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full xl:w-1/3 bg-white rounded-lg py-6">
                            <div className=' justify-center text-gray-500 p-10 py-5'>
                                <p>I just had to take a moment to express my gratitude for the outstanding service they provided. Their complete assistance and efforts were truly remarkable</p>
                                <div className="flex justify-between items-center">
                                    <div className='mt-10'>
                                        <p className='font-bold text-black '>Fredrick Hill</p>
                                        <p>CO-Founder CEO</p>
                                    </div>
                                    <div>
                                        <img src="../../assets/images/review1.jpg" alt="" className='w-[70px] h-13 rounded-full' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div div className="w-full xl:w-1/3 bg-white hover:bg-gray-100 rounded-lg min-h-full flex flex-col">
                            <div className="flex text-gray-500 p-10 py-5 flex-grow min-h-full items-center justify-center">
                                <Link>
                                <div className='flex items-center text-black'>
                                    <h1>More Reviews</h1>
                                    <img width="30" height="30" className='ml-2' src="https://img.icons8.com/ios-glyphs/30/long-arrow-right.png" alt="long-arrow-right"/>
                                </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CustomerSuccess