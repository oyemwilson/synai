import React, { useState, useEffect } from 'react';

const HeroBanner = () => {

  const words = ['all-in-one', 'integrated', 'complete'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [words.length]);
  const logos = [
    "../../assets/images/logo-1-black.svg",
    "../../assets/images/logo-2-black.svg",
    "../../assets/images/logo-3-black.svg",
    "../../assets/images/logo-4-black.svg",
    "../../assets/images/logo-5-black.svg",
  ];


  return (
    <div className='bg-gray-100 xl:h-[100vh] lg:h-[74vh] md:h-[60vh] '>
      <div className=''>
        <div className='flex flex-col py-15 justify-center'>
          <div className='flex flex-col md:flex-row gap-4 p-4 mt-10'>
            <div className='flex-1 lg:mt-20 flex justify-center'>
              <div>
                <h1 className="text-left text-3xl xl:text-6xl lg:text-4xl font-bold text-gray-800 leading-tight xl:leading-tight  lg:leading-loose">
                  Your{' '}
                  <span className="inline-block absolute ml-3 transition-opacity animate-reveal-fade-out">
                    {words[currentWordIndex]}
                  </span>{' '}
                  <br />
                  CRM platform
                  <br />
                  built for <span className='underline decoration-green-500'>success </span>
                </h1>
                <p className='mt-10'>Transform your business with our intelligent CRM solutions. <br />Drive sales, track leads, automate tasks, enhance service, <br />boost efficiency – all in one place.</p>
                <div class="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mt-10">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    class="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none "
                  />
                  <button
                    class="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Join Waitlist
                  </button>
                </div>
              </div>

            </div>
            <div className='flex-1 hidden md:block'>
              <img src='../../assets/images/dashboard-mock.png' alt='hero-banner' />
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center w-[70vw] overflow-hidden container mx-auto mt-10">
      <div className="flex-shrink-0 pb-4 md:pb-0 md:pr-6 text-center md:text-left">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 whitespace-nowrap opacity-30">
          Trusted by industry leaders:
        </h2>
      </div>
      <div className="flex-1 overflow-hidden w-full md:w-auto">
        <div className="flex animate-slide-step whitespace-nowrap  inline-flex">
          {logos.concat(logos).map((logo, index) => (
            <div
              key={`logo-${index}`}
              className="w-full md:w-1/3 text-center lg:w-1/5 px-2 flex justify-center items-center flex-shrink-0  "
            >
              <img src={logo} alt={`Logo ${index % 5 + 1}`} className="h-16 object-contain w-1/2 lg:w-1/2 logo-img opacity-30" />
            </div>
          ))}
        </div>
      </div>
    </div>
      </div>
    </div>
  )
}

export default HeroBanner