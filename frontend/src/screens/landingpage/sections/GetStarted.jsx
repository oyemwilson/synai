import React from 'react'

const GetStarted = () => {
    return (
        <>
            <div className='container mx-auto lg:px-20 py-20'>
                <div className="flex flex-col md:flex-row relative">
                    <div className="w-full md:w-1/2 p-4 text-white">
                        <div>
                            <p className='bg-green-100 inline-block text-green-500'>Get started</p>
                            <h1 className='text-4xl lg:text-5xl'>Ready to<span className='underline decoration-green-500'> supercharge</span> your business?</h1>
                            <div className='md:w-1/2 mt-5'>
                                <p>Grow sales and stay ahead in the competitive market by being among the first to benefit from our game-changing solutions.</p>
                            </div>
                            <hr className='w-1/3 my-10 border-gray-500' />
                            <div className='mt-5'>
                                <a href="#_" className="mr-4 px-5 py-2.5 relative rounded group font-medium bg-green-400 text-white inline-block">
                                    <span className="absolute top-0 left-0 flex w-full h-0 mb-0 transition-all duration-200 ease-out transform translate-y-0 bg-gray-900 group-hover:h-full opacity-90"></span>
                                    <span className="relative group-hover:text-white">Get Started</span>
                                </a>
                                <a href="#_" className="px-5 py-2.5  relative rounded group font-medium bg-gray-100 text-black inline-block">
                                    <span className="absolute top-0 left-0 flex w-full h-0 mb-0 transition-all duration-200 ease-out transform translate-y-0 bg-gray-900 group-hover:h-full opacity-90"></span>
                                    <span className="relative group-hover:text-white">Contact Sale</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2  relative inline-block mt-10">
                        <div className=' rounded-lg w-[100%] md:w-[100%] pt-20 xl:pt-0'>
                            <img src="../../assets/images/getstarted.png" alt="A description of my image" className="relative z-20" />
                         </div>
                    </div>
                    <img src="../../assets/images/crm-shape-2.svg" className="h-[80%] xl:h-[120%]  absolute lg:bottom-[-150px] bottom-[-250px] lg:right-[-500px] right-[-300px] z-10 transition-all duration-100 " alt="A description of my image" />

                </div>
            </div>
        </>
    )
}

export default GetStarted