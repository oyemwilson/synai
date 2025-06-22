import { useState, useEffect } from 'react';

const Navigation = () => {

  const [activeSection, setActiveSection] = useState('section1');
  const [isSticky, setIsSticky] = useState(true);

  const navItems = [
    { id: 'section1', label: 'Item 1',  icon: <img width="25" height="25" src="https://img.icons8.com/ios-filled/50/shop.png" style={{
        filter: 'invert(40%) sepia(80%) saturate(400%) hue-rotate(90deg)',
      }}alt="shop"/>,},
    { id: 'section2', label: 'Item 2',icon: <img width="25" height="25" src="https://img.icons8.com/ios/50/conference-call--v1.png" style={{
        filter: 'invert(40%) sepia(80%) saturate(400%) hue-rotate(90deg)',
      }} alt="conference-call--v1"/> },
    { id: 'section3', label: 'Item 3', icon: <img width="25" height="25" style={{
        filter: 'invert(40%) sepia(80%) saturate(400%) hue-rotate(90deg)',
      }} src="https://img.icons8.com/external-yogi-aprelliyanto-basic-outline-yogi-aprelliyanto/64/external-calender-time-and-date-yogi-aprelliyanto-basic-outline-yogi-aprelliyanto.png" alt="external-calender-time-and-date-yogi-aprelliyanto-basic-outline-yogi-aprelliyanto"/>},
  ];

  // Handle smooth scroll
  const handleNavClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Only update the active section after scrolling is complete
      element.scrollIntoView({ behavior: 'smooth' });
      
      // Wait for the scroll animation to complete before updating active section
      const scrollDuration = 600; // Approximate duration of smooth scroll in ms
      setTimeout(() => {
        setActiveSection(sectionId);
      }, scrollDuration);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight; // Bottom of viewport
      const navHeight = document.querySelector('nav')?.offsetHeight ||0; // Navbar height

      // Check section3 bottom position
      const section3 = document.getElementById('section3');
      if (section3) {
        const section3Top = section3.offsetTop;
        const section3Height = section3.offsetHeight;
        const section3Bottom = section3Top + section3Height;

        // Stop being sticky when viewport bottom passes section3 bottom
        setIsSticky(scrollPosition < section3Bottom - navHeight);
      }

      // Update active section
      const scrollTop = window.scrollY + 200; // For active section detection
      navItems.forEach((item) => {
        const section = document.getElementById(item.id);
        if (section) {
          const offsetTop = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollTop >= offsetTop && scrollTop < offsetTop + height) {
            setActiveSection(item.id);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);
  return (
    <>
<nav className={`${isSticky ? 'md:sticky top-0' : 'relative'} bg-white z-50  `}>
      <ul className="flex flex-col md:flex-row justify-center gap-4 align-center container mx-auto md:px-20 ">
        {navItems.map((item) => (
          <li key={item.id} className="flex-1 min-w-[200px]">
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.id);
              }}
              className={`block text-center py-8 px-4 flex items-center justify-center
                ${activeSection === item.id 
                  ? 'text-green-500  relative after:content-[""] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[0px] md:after:h-[2px] after:bg-green-500' 
                  : 'text-gray-400 border-transparent hover:border-gray-200 hover:bg-gray-00 hover:text-green-500'}`}
            >
                
               <span className='mr-3 '>{item.icon}</span> 
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <hr className="border-t-2 border-gray-200"></hr>
    </nav>
    </>
  )
}

export default Navigation