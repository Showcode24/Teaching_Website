const About = () => {
  return (
    <div id="about" className="about-style-foura-rea default-padding bg-gray">
      <div className="container">
        <div className="row">
          {/* Image Section */}
          <div className="col-xl-6 col-lg-5 pr-100 pr-md-15 pr-xs-15">
            <div className="about-style-four-thumb">
              <img className="animate" data-animate="fadeInUp" src="assets/img/image-1.jpg" alt="Tutoring in action" />
              <img
                className="animate"
                data-animate="fadeInLeft"
                data-delay="300ms"
                src="assets/img/image-2.jpg"
                alt="Happy student with tutor"
              />
              <div className="short-card animate" data-animate="fadeInRight" data-delay="500ms">
                <div className="icon">
                  <img src="assets/img/icon/30.png" alt="Support Icon" />
                </div>
                <div className="info">
                  <h5>We’re always here to support you</h5>
                </div>
              </div>
            </div>
          </div>
          {/* Content Section */}
          <div className="col-xl-6 col-lg-7">
            <div className="about-style-four-info">
              <h4 className="sub-title">
                <img src="assets/img/icon/home-3.png" alt="Icon" /> About Kopa 360
              </h4>
              <h2 className="title split-text">Connecting Parents & Tutors Seamlessly</h2>
              <p>
                Kopa 360 is designed to make the tutoring process effortless. Whether you're a parent searching for the perfect tutor or a tutor looking for new opportunities, our platform ensures smooth and secure interactions from start to finish.
              </p>
              <ul className="list-style-five">
                <li>
                  <h4>Find Top Tutors</h4>
                  <p>
                    Browse verified tutors and connect with the best match for your child's learning needs.
                  </p>
                </li>
                <li>
                  <h4>Secure & Transparent Payments</h4>
                  <p>
                    Payments are processed securely, ensuring peace of mind for both parents and tutors.
                  </p>
                </li>
              </ul>
              <div className="f-flex align-items-center mt-20">
                <a className="btn btn-theme btn-md animation" href="/sign-up">Get Started</a>
                <div className="social-list">
                  <ul>
                    <li>
                      <a href="#"><i className="fab fa-facebook-f"></i></a>
                    </li>
                    <li>
                      <a href="#"><i className="fab fa-twitter"></i></a>
                    </li>
                    <li>
                      <a href="#"><i className="fab fa-whatsapp"></i></a>
                    </li>
                    <li>
                      <a href="#"><i className="fab fa-instagram"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
