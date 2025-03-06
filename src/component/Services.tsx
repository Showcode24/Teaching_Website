const Services = () => {
  return (
    <div
      id="services"
      className="service-style-four-area default-padding text-light bg-cover"
      style={{
        backgroundColor: '#062835',
        backgroundImage: 'url(assets/img/shape/1.png)',
      }}
    >

      <div className="container">
        <div className="row">
          <div className="col-xl-6 offset-xl-3 col-lg-8 offset-lg-2">
            <div className="site-heading text-center">
              <h4 className="sub-title">
                <img src="assets/img/icon/home-3.png" alt="Image Not Found" /> How Kopa 360 Works
              </h4>
              <h2 className="title split-text">Seamless tutoring services for parents and tutors</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="services-style-two-carousel swiper">
              <div className="swiper-wrapper">
                {/* Single Item */}
                <div className="swiper-slide">
                  <div className="services-style-four animate" data-animate="fadeInUp">
                    <img src="assets/img/icon/33.png" alt="Image Not Found" />
                    <h4>
                      <a href="#">Post a Job</a>
                    </h4>
                    <p>
                      Parents can easily post job listings detailing their child's tutoring needs.
                    </p>
                  </div>
                </div>

                {/* Single Item */}
                <div className="swiper-slide">
                  <div className="services-style-four animate" data-animate="fadeInUp">
                    <img src="assets/img/icon/34.png" alt="Image Not Found" />
                    <h4>
                      <a href="#">Apply as a Tutor</a>
                    </h4>
                    <p>
                      Tutors can browse jobs and apply for opportunities that match their expertise.
                    </p>
                  </div>
                </div>

                {/* Single Item */}
                <div className="swiper-slide">
                  <div className="services-style-four animate" data-animate="fadeInUp">
                    <img src="assets/img/icon/35.png" alt="Image Not Found" />
                    <h4>
                      <a href="#">Secure Payments</a>
                    </h4>
                    <p>
                      Payments are securely handled within the platform, ensuring safety for both parties.
                    </p>
                  </div>
                </div>

                {/* Single Item */}
                <div className="swiper-slide">
                  <div className="services-style-four animate" data-animate="fadeInUp">
                    <img src="assets/img/icon/36.png" alt="Image Not Found" />
                    <h4>
                      <a href="#">Track Progress</a>
                    </h4>
                    <p>
                      Parents can monitor their child's progress and communicate with tutors easily.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
