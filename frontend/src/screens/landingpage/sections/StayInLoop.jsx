import React from 'react'

const StayInLoop = () => {
    return (
        <>
        <div className="container mx-auto xl:px-20">
        <div className="flex flex-col md:flex-row justify- items-center gap-6 p-6 w-full lg:mx-auto text-black">
                <div className="w-full md:w-1/2 text-xl text-left"> <h1>Want to receive news and updates?</h1></div>
                <div className="w-full md:w-1/2  text-lg p-4 text-end">
                <div class="flex flex-col sm:flex-row gap-2  mx-auto mt-10">
                <input
  type="email"
  placeholder="Enter your email"
  className="w-full sm:w-2/3 md:w-3/4 px-6 xl:py-1 border border-gray-300 rounded-md focus:outline-none"
/>
                  <button
                    class="bg-green-500 text-white px-6 xl:py-1 rounded-md hover:bg-green-500 transition-colors"
                  >
                    Stay in the loop
                  </button>
                </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default StayInLoop