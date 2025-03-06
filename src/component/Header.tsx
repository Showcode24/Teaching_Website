import { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { navLinks, topBarData } from "../data/header-data";

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar-area top-bar-style-three bg-dark text-light">
        <div className="container">
          <div className="row align-center">
            <div className="col-xl-9 col-lg-7">
              <ul className="item-flex">
                <li>
                  <i className="fas fa-map-marker-alt"></i> {topBarData.location}
                </li>
                <li>
                  <i className="fas fa-clock"></i> {topBarData.openingHours}
                </li>
              </ul>
            </div>
            <div className="col-xl-3 col-lg-5 text-end">
              <div className="item-flex">
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header id="home">
        <nav className="navbar mobile-sidenav navbar-style-two navbar-sticky validnavs">
          {/* Search Bar */}
          <div className={`top-search ${isSearchOpen ? 'active' : ''}`}>
            <div className="container-xl">
              <div className="input-group">
                <span className="input-group-addon">
                  <Search size={20} />
                </span>
                <input type="text" className="form-control" placeholder="Search" />
                <span className="input-group-addon close-search" onClick={toggleSearch}>
                  <X size={20} />
                </span>
              </div>
            </div>
          </div>


          <div className="container d-flex justify-content-between align-items-center">
            {/* Logo & Toggle Button */}
            <div className="navbar-header">
              <button
                type="button"
                className="navbar-toggle"
                onClick={toggleNav}
                aria-label="Toggle navigation"
              >
                <Menu size={24} />
              </button>
              <a className="navbar-brand smooth-menu" href="/">
                <img src="assets/img/Kopa360-logo.png" className="logo logo-display" alt="Logo" />
                <img src="assets/img/Kopa360-logo.png" className="logo logo-scrolled" alt="Logo" />
              </a>
            </div>

            {/* Navbar Links */}
            <div className="navbar-right d-flex align-items-center">
              <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbar-menu">
                <ul className="nav navbar-nav navbar-center" data-in="fadeInDown" data-out="fadeOutUp">
                  {navLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="smooth-menu" onClick={() => setIsNavOpen(false)}>
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Search & Menu Button */}
              <div className="attr-right">
                <div className="attr-nav attr-box">
                  <ul>
                    <li className="search">
                      <a href="#" onClick={(e) => {
                        e.preventDefault();
                        toggleSearch();
                      }}>
                        <Search size={20} />
                      </a>
                    </li>
                    {/* <div className="social">
                      <ul>
                        <li>
                          <a href="/login">Login</a>
                        </li>
                        <li>
                          <a href="/sign-up">Signup</a>
                        </li>
                      </ul>
                    </div> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay Screen */}
          {/* <div className={`overlay-screen ${isNavOpen ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}></div> */}
        </nav>

        {/* Side Panel */}
        {/* <div className={`side ${isNavOpen ? 'active' : ''}`}>
          <a href="#" className="close-side" onClick={(e) => {
            e.preventDefault();
            setIsNavOpen(false);
          }}>
            <X size={20} />
          </a>
          <div className="widget">
            <div className="logo">
              <img src="assets/img/logo-light.png" alt="Logo" />
            </div>
            <p>
              Arrived compass prepare an on as. Reasonable particular on my it in sympathize.
              Size now easy eat hand how. Unwilling he departure elsewhere dejection at.
              Heart large seems may purse means few blind.
            </p>
          </div>
          <div className="widget address">
            <div>
              <ul>
                <li>
                  <div className="content">
                    <p>Address</p>
                    <strong>California, TX 70240</strong>
                  </div>
                </li>
                <li>
                  <div className="content">
                    <p>Email</p>
                    <strong>support@validtheme.com</strong>
                  </div>
                </li>
                <li>
                  <div className="content">
                    <p>Contact</p>
                    <strong>+44-20-7328-4499</strong>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="widget newsletter">
            <h4 className="title">Get Subscribed!</h4>
            <form action="#">
              <div className="input-group stylish-input-group">
                <input type="email" placeholder="Enter your e-mail" className="form-control" name="email" />
                <span className="input-group-addon">
                  <button type="submit">
                    <i className="arrow_right"></i>
                  </button>
                </span>
              </div>
            </form>
          </div>
          <div className="widget social">
            <ul className="link">
              <li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
              <li><a href="#"><i className="fab fa-twitter"></i></a></li>
              <li><a href="#"><i className="fab fa-linkedin-in"></i></a></li>
              <li><a href="#"><i className="fab fa-behance"></i></a></li>
            </ul>
          </div>
        </div> */}
      </header>
    </>
  );
};

export default Header;











// import { navLinks, topBarData } from "../data/header-data";

// const Header = () => {
//   return (
//     <>
//       {/* Top Bar */}
//       <div className="top-bar-area top-bar-style-three bg-dark text-light">
//         <div className="container">
//           <div className="row align-center">
//             <div className="col-xl-9 col-lg-7">
//               <ul className="item-flex">
//                 <li>
//                   <i className="fas fa-map-marker-alt"></i> {topBarData.location}
//                 </li>
//                 <li>
//                   <i className="fas fa-clock"></i> {topBarData.openingHours}
//                 </li>
//               </ul>
//             </div>
//             <div className="col-xl-3 col-lg-5 text-end">
//               <div className="item-flex">
//                 <div className="social">
//                   <ul>
//                     <li>
//                       <a href="/login">Login</a>
//                     </li>
//                     <li>
//                       <a href="/signup">Signup</a>
//                     </li>
//                   </ul>

//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Header */}
//       <header id="home">
//         <nav className="navbar mobile-sidenav navbar-style-two navbar-sticky validnavs">
//           {/* Search Bar */}
//           <div className="top-search">
//             <div className="container-xl">
//               <div className="input-group">
//                 <span className="input-group-addon">
//                   <i className="fas fa-search"></i>
//                 </span>
//                 <input type="text" className="form-control" placeholder="Search" />
//                 <span className="input-group-addon close-search">
//                   <i className="fas fa-times"></i>
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="container d-flex justify-content-between align-items-center">
//             {/* Logo & Toggle Button */}
//             <div className="navbar-header">
//               <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#navbar-menu">
//                 <i className="fas fa-bars"></i>
//               </button>
//               <a className="navbar-brand smooth-menu" href="#home">
//                 <img src="assets/img/Kopa360-logo.png" className="logo logo-display" alt="Logo" />
//                 <img src="assets/img/Kopa360-logo.png" className="logo logo-scrolled" alt="Logo" />
//               </a>
//             </div>

//             {/* Navbar Links */}
//             <div className="navbar-right d-flex align-items-center">
//               <div className="collapse navbar-collapse" id="navbar-menu">
//                 <ul className="nav navbar-nav navbar-center" data-in="fadeInDown" data-out="fadeOutUp">
//                   {navLinks.map((link, index) => (
//                     <li key={index} >
//                       <a href={link.href} className="smooth-menu">{link.name}</a>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               {/* Search & Menu Button */}
//               <div className="attr-right">
//                 <div className="attr-nav attr-box">
//                   <ul>
//                     <li className="search">
//                       <a href="#"><i className="fas fa-search"></i></a>
//                     </li>
//                     {/* <li className="side-menu">
//                       <a href="#">
//                         <span className="bar-1"></span>
//                         <span className="bar-2"></span>
//                         <span className="bar-3"></span>
//                       </a>
//                     </li> */}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Overlay Screen */}
//           <div className="overlay-screen"></div>
//         </nav>

//         {/* Side Panel */}
//         <div className="side">
//           <a href="#" className="close-side">
//             <i className="fas fa-times"></i>
//           </a>
//           <div className="widget">
//             <div className="logo">
//               <img src="assets/img/logo-light.png" alt="Logo" />
//             </div>
//             <p>
//               Arrived compass prepare an on as. Reasonable particular on my it in sympathize.
//               Size now easy eat hand how. Unwilling he departure elsewhere dejection at.
//               Heart large seems may purse means few blind.
//             </p>
//           </div>
//           <div className="widget address">
//             <div>
//               <ul>
//                 <li>
//                   <div className="content">
//                     <p>Address</p>
//                     <strong>California, TX 70240</strong>
//                   </div>
//                 </li>
//                 <li>
//                   <div className="content">
//                     <p>Email</p>
//                     <strong>support@validtheme.com</strong>
//                   </div>
//                 </li>
//                 <li>
//                   <div className="content">
//                     <p>Contact</p>
//                     <strong>+44-20-7328-4499</strong>
//                   </div>
//                 </li>
//               </ul>
//             </div>
//           </div>
//           <div className="widget newsletter">
//             <h4 className="title">Get Subscribed!</h4>
//             <form action="#">
//               <div className="input-group stylish-input-group">
//                 <input type="email" placeholder="Enter your e-mail" className="form-control" name="email" />
//                 <span className="input-group-addon">
//                   <button type="submit">
//                     <i className="arrow_right"></i>
//                   </button>
//                 </span>
//               </div>
//             </form>
//           </div>
//           <div className="widget social">
//             <ul className="link">
//               <li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
//               <li><a href="#"><i className="fab fa-twitter"></i></a></li>
//               <li><a href="#"><i className="fab fa-linkedin-in"></i></a></li>
//               <li><a href="#"><i className="fab fa-behance"></i></a></li>
//             </ul>
//           </div>
//         </div>
//       </header>
//     </>
//   );
// };

// export default Header;
