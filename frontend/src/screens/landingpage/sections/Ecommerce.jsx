import { useEffect, useRef } from 'react';

const Ecommerce = () => {
    const smallImageRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (smallImageRef.current) {
                const scrollPosition = window.scrollY;
                const moveUp = scrollPosition * 0.06;
                smallImageRef.current.style.transform = `translateY(-${moveUp}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return (
        <>
            <div className='container mx-auto lg:px-20 md:py-20'>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 p-4 bg-white">
                        <div>
                            <p className='bg-green-100 inline-block text-green-500'>E-COMMERCE</p>
                            <h1 className='text-4xl lg:text-5xl'><span className='underline decoration-green-500'>Increase sales </span><br /> and manage orders</h1>
                            <p className='mt-5'>Grow your eCommerce business with custom <br />solutions and streamlined order processing.<br /> Start your success story today!</p>
                            <div className='mt-5'>
                                <div className='block'>
                                    <p className='inline-flex items-center gap-2 bg-gray-300 rounded-md px-4 py-1 min-w-[40%] m-1'>
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                                            <path fill="#43A047" d="M40.6 12.1L17 35.7 7.4 26.1 4.6 29 17 41.3 43.4 14.9z"></path>
                                        </svg>
                                        <span>Increase conversion rates</span>
                                    </p>
                                </div>
                                <div className='block'>
                                    <p className='inline-flex items-center gap-2 bg-gray-300 rounded-md px-4 py-1 min-w-[40%] m-1'>
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                                            <path fill="#43A047" d="M40.6 12.1L17 35.7 7.4 26.1 4.6 29 17 41.3 43.4 14.9z"></path>
                                        </svg>
                                        <span>Optimize inventory levels</span>
                                    </p>
                                </div>
                                <div className='block'>
                                    <p className='inline-flex items-center gap-2 bg-gray-300 rounded-md px-4 py-1 min-w-[40%] m-1'>
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                                            <path fill="#43A047" d="M40.6 12.1L17 35.7 7.4 26.1 4.6 29 17 41.3 43.4 14.9z"></path>
                                        </svg>
                                        <span>Increase conversion rates</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2  relative inline-block">
                        <div className='bg-gray-200 p-6 rounded-lg'>
                            <img src="../../assets/images/ecommerce.png" alt="A description of my image" className="relative z-10" />
                            <img src="../../assets/images/ecommernce2.png" ref={smallImageRef} className="h-[35%] border rounded-xl absolute bottom-0 right-[-50px] z-20 transition-all duration-100 hidden lg:block" alt="A description of my image" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Ecommerce