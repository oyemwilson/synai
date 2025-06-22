import React from 'react'
import Navbar from '../../components/Navbar'
import HeroBanner from './sections/HeroBanner'
import styles from './landingpage.css'
import Crm from './sections/Crm'
import Navigation from '../../components/Navigation'
import Ecommerce from './sections/Ecommerce'
import Client from './sections/Client'
import Inventory from './sections/Inventory'
import Integrations from './sections/Integrations'
import UptoDate from './sections/UptoDate'
import CustomerSuccess from './sections/CustomerSuccess'
import GetStarted from './sections/GetStarted'
import StayInLoop from './sections/StayInLoop'
import Footer from '../../components/Footer'
const LandingPage = () => {
  return (
    <>
      <Navbar />
      <HeroBanner />
      <Crm />
      <Navigation />
      <div id="section1" className=" bg-white ">
        <Ecommerce />
      </div>
      <div id="section2" className=" bg-white ">
        <Client />
      </div>
      <div id="section3" className=" bg-white ">
       <Inventory />
      </div>
      <div i="secttt3" className=" bg-gray-100 ">
        <Integrations />
      </div>
      <div i="sect3" className="bg-white">
        <UptoDate />
      </div>
      <div className="bg-gray-100">
      <CustomerSuccess />
      </div>
      <div className="bg-cyan-900 xl:h-[60vh] lg:h-[60vh] overflow-hidden">
        <GetStarted />
      </div>
      <StayInLoop />
      <Footer />
    </>
  )
}

export default LandingPage