import { footerData } from '../data/footer-data';

const Footer = () => {
  return (
    <footer
      className="footer-one text-light"
      style={{
        backgroundColor: '#062835',
        backgroundImage: 'url(assets/img/shape/27.png)',
      }}
    >

      <div className="container">
        <div className="footer-style-one">
          <div className="row">
            {/* Single Item */}
            <div className="col-lg-4 col-md-12 footer-item mt-50">
              <div className="f-item about">
                <div className="logo">
                  <img src={footerData.logoSrc} alt="Image Not Found" />
                </div>
                <p>{footerData.aboutText}</p>
                <div className="opening-hours">
                  <h5>Opening Hours</h5>
                  <ul className="opening-list">
                    {footerData.openingHours.map((hour, index) => (
                      <li key={index}>
                        {hour.day} <span className="text-end">{hour.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a className="btn btn-theme btn-md animation mt-30" href="contact.html">
                  Contact Us
                </a>
              </div>
            </div>
            {/* End Single Item */}

            {/* Explore Links */}
            <div className="col-lg-2 col-md-6 mt-50 footer-item">
              <div className="f-item link">
                <h4 className="widget-title">Explore</h4>
                <ul>
                  {footerData.exploreLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.url}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* End Explore Links */}

            {/* Our Services Links */}
            <div className="col-lg-3 col-md-6 mt-50 footer-item">
              <div className="f-item link">
                <h4 className="widget-title">Our Services</h4>
                <ul>
                  {footerData.servicesLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.url}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* End Our Services Links */}

            {/* Contact Info */}
            <div className="col-lg-3 col-md-12 footer-item mt-50">
              <div className="f-item contact">
                <h4 className="widget-title">Contact Info</h4>
                <ul>
                  {footerData.contactInfo.map((contact, index) => (
                    <li key={index}>
                      <div className="icon">
                        <i className={contact.icon}></i>
                      </div>
                      <div className="content">
                        {contact.icon === 'fas fa-phone' ? (
                          contact.content.split(',').map((phone, i) => (
                            <div key={i}>
                              <a href={`tel:${phone.trim()}`}>{phone.trim()}</a>
                              <br />
                            </div>
                          ))
                        ) : (
                          contact.content
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* End Contact Info */}
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom text-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <p>{footerData.copyrightText}</p>
            </div>
            <div className="col-lg-6 text-end">
              <ul>
                {footerData.footerBottomLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.url}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* End Footer Bottom */}
    </footer>
  );
};

export default Footer;
