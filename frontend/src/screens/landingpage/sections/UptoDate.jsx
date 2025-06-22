import React from 'react'
import { Link } from 'react-router-dom';

const UptoDate = () => {
    return (
        <>
            <div className="">
                <div className="lg:container lg:mx-auto px-0 lg:px-20 py-20">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-0  p-6 w-full mx-auto text-black">
                        <div className="w-full md:w-1/3 text-4xl  lg:text-5xl md:p-4 text-left "> <h1>Stay  <span className='underline decoration-green-500'> up to date </span> on our journey</h1></div>
                        <div className="w-full md:w-1/2  text-lg md:p-4 py-4 text-left"><p>Explore the latest trends, tips, and insights in our world. Get the knowledge to empower your business growth and increase productivity.</p></div>
                        <div className=" flex w-full md:w-1/4 md:justify-end">  <a href="#_" className="px-5 py-2.5 relative rounded-lg group font-medium bg-green-500 text-white inline-block">
                            <span className="absolute top-0 left-0 flex w-full h-0 mb-0 transition-all duration-200 ease-out transform rounded-lg translate-y-0 bg-gray-900 group-hover:h-full opacity-90"></span>
                            <span className="relative group-hover:text-white">View all article</span>
                        </a></div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 p-6 w-full mx-auto">
                        <div className="w-full xl:w-1/3 p-10 rounded-lg">
                            <div className='text-left text-black '>
                                <div className="relative inline-block ">
                                    <Link to="/">
                                        <div className="relative overflow-hidden rounded-lg">
                                            <img
                                                src="../../assets/images/crm-blog-1-768x497.jpg"
                                                alt="CRM Blog Image"
                                                className="transform transition-transform duration-300 hover:scale-110 w-full h-full object-cover "
                                            />
                                        </div>
                                    </Link>
                                    <div className='flex gap-3 absolute top-2 right-1'>
                                        <p className='bg-white text-sm text-green-500 px-2 rounded-lg'>MARKETING</p>
                                        <p className='bg-white text-sm text-green-500 px-2 rounded-lg'>TECHNOLOGY</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <img width="12" height="12" src="https://img.icons8.com/forma-light-sharp/24/person-male.png" alt="person-male" className="w-4 h-4 " />
                                    <p className='pe-3 p-1' >KEYDESIGN</p>
                                    <img width="12" height="12" src="https://img.icons8.com/material-outlined/24/calendar--v1.png" alt="calendar--v1" className="w-4 h-4" />
                                    <p className='pe-3 p-1'>JUNE 21, 2025</p>
                                    <img width="12" height="12" src="https://img.icons8.com/windows/32/filled-chat.png" alt="filled-chat" className="w-4 h-4" />
                                    <p className='pe-3 p-1'>3</p>
                                </div>
                                <Link to="/">
                                    <h2 className='font-bold my-3 text-2xl mt-4 hover:text-green-500'>Challenges of creating and structuring a multi-brand system</h2>
                                </Link>
                                <p className='my-3'>The concept of a multi-brand system has gained traction to manage various brands.</p>
                                <Link>
                                <p className='pb-2 link-underline link-underline-black inline'>Read more</p>
                                </Link>
                            </div>
                        </div>
                        <div className="w-full xl:w-1/3 p-10 rounded-lg">
                            <div className='text-left text-black '>
                                <div className="relative inline-block">
                                    <Link to="/">
                                        <div className="relative overflow-hidden rounded-lg">
                                            <img
                                                src="../../assets/images/crm-blog-3-768x497.jpg"
                                                alt="CRM Blog Image"
                                                className="transform transition-transform duration-300 hover:scale-110 w-full h-full object-cover"
                                            />
                                        </div>
                                    </Link>
                                    <div className='flex gap-3 absolute top-2 right-1'>
                                        <p className='bg-white text-sm text-green-500 px-2 rounded-lg'>INSIGHTS</p>
                                        <p className='bg-white text-sm text-green-500 px-2 rounded-lg'>MARKETING</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <img width="12" height="12" src="https://img.icons8.com/forma-light-sharp/24/person-male.png" alt="person-male" className="w-4 h-4 " />
                                    <p className='pe-3 p-1' >KEYDESIGN</p>
                                    <img width="12" height="12" src="https://img.icons8.com/material-outlined/24/calendar--v1.png" alt="calendar--v1" className="w-4 h-4" />
                                    <p className='pe-3 p-1'>JUNE 21, 2025</p>
                                    <img width="12" height="12" src="https://img.icons8.com/windows/32/filled-chat.png" alt="filled-chat" className="w-4 h-4" />
                                    <p className='pe-3 p-1'>3</p>
                                </div>
                                <Link to="/">
                                    <h2 className='font-bold my-3 text-2xl mt-4 hover:text-green-500'>The five-step process for running effective brainstorming sessions</h2>
                                </Link>
                                <p className='my-3'>A well-defined statement helps participants focus on creativity and ensures same page.</p>
                                <Link>
                                <p className='pb-2 link-underline link-underline-black inline'>Read more</p>
                                </Link>
                            </div>
                        </div>
                        <div className="w-full xl:w-1/3 p-10 rounded-lg">
                            <div className='text-left text-black '>
                                <div className="relative inline-block">
                                    <Link to="/">
                                        <div className="relative overflow-hidden rounded-lg">
                                            <img
                                                src="../../assets/images/crm-blog-4-768x497.jpg"
                                                alt="CRM Blog Image"
                                                className="transform transition-transform duration-300 hover:scale-110 w-full h-full object-cover"
                                            />
                                        </div>
                                    </Link>
                                    <div className='flex gap-3 absolute top-2 right-1'>
                                        <p className='bg-white text-sm text-green-500 px-2 rounded-lg'>GUIDES</p>
                                        <p className='bg-white text-sm text-green-500 px-2 rounded-lg'>INSIGHTS</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <img width="12" height="12" src="https://img.icons8.com/forma-light-sharp/24/person-male.png" alt="person-male" className="w-4 h-4 " />
                                    <p className='pe-3 p-1' >KEYDESIGN</p>
                                    <img width="12" height="12" src="https://img.icons8.com/material-outlined/24/calendar--v1.png" alt="calendar--v1" className="w-4 h-4" />
                                    <p className='pe-3 p-1'>JUNE 21, 2025</p>
                                    <img width="12" height="12" src="https://img.icons8.com/windows/32/filled-chat.png" alt="filled-chat" className="w-4 h-4" />
                                    <p className='pe-3 p-1'>3</p>
                                </div>
                                <Link to="/">
                                    <h2 className='font-bold my-3 text-2xl mt-4 hover:text-green-500'>A quick guide to picking the right branding agency for your rebrand</h2>
                                </Link>
                                <p className='my-3'>When evaluating potential agencies, consider their aspects of branding and design.</p>
                                <Link>
                                <p className='pb-2 link-underline link-underline-black inline'>Read more</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UptoDate