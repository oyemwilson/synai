import React from 'react'

const Crm = () => {
    return (
        <>
            <div className="crm">
                <div className="container mx-auto md:px-20 py-20">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 p-6 w-full mx-auto text-white">
                        <div className="w-full md:w-1/2 text-4xl lg:text-5xl p-4 text-left"> <h1><span className='underline decoration-green-500'>Experience</span>  CRM <br />excellence</h1></div>
                        <div className="w-full md:w-1/2  text-lg p-4 text-left"><p>From intelligent sales automation that accelerates deals to robust reporting and analytics, our software solution is designed to make your business succed.</p></div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 p-6 w-full mx-auto">
                        <div className="w-full xl:w-1/3 bg-purple-200 p-10 text-center crm-bg hover:bg-green-500 rounded-lg">
                            <div className='text-left text-white '>
                                <img width="50" height="50" src="https://img.icons8.com/ios/50/goal--v1.png" style={{ filter: 'brightness(0) invert(1)' }} alt="goal--v1" />
                                <h2 className='font-bold my-3 text-2xl mt-4'>Sales Automation</h2>
                                <p>Multiply your sales efforts with intelligent automation. Close deals faster, and with greater precision</p>
                                <p className='my-3'>Learn more</p>
                            </div>
                        </div>
                        <div className="w-full xl:w-1/3  p-10 text-center crm-bg hover:bg-green-500 rounded-lg">
                            <div className='text-left text-white'>
                                <img width="50" height="50" src="https://img.icons8.com/windows/32/marketing.png" style={{ filter: 'brightness(0) invert(1)' }} alt="marketing" />
                                <h2 className='font-bold my-3 text-2xl mt-4'>Sales Automation</h2>
                                <p>Multiply your sales efforts with intelligent automation. Close deals faster, and with greater precision</p>
                                <p className='my-3'>Learn more</p>
                            </div></div>
                        <div className="w-full xl:w-1/3  p-10 text-center crm-bg hover:bg-green-500 rounded-lg">
                            <div className='text-left text-white'>
                                <img width="50" height="50" src="https://img.icons8.com/ios/50/globe--v1.png" style={{ filter: 'brightness(0) invert(1)' }} alt="globe--v1" />
                                <h2 className='font-bold my-3 text-2xl mt-4'>Sales Automation</h2>
                                <p>Multiply your sales efforts with intelligent automation. Close deals faster, and with greater precision</p>
                                <p className='my-3'>Learn more</p>
                            </div></div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Crm