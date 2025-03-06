const Features = () => {
  return (
    <div id="features" className="feature-style-three-area default-padding">
      <div className="container">
        <div className="heading-left">
          <div className="row">
            <div className="col-xl-5 col-lg-6">
              <h4 className="sub-title">
                <img src="assets/img/icon/home-3.png" alt="Image Not Found" /> Why Choose Kopa 360?
              </h4>
              <h2 className="title split-text">The Best Tutoring Experience for Parents & Tutors</h2>
            </div>
            <div className="col-xl-6 offset-xl-1 col-lg-6">
              <p>
                Kopa 360 makes finding and hiring a tutor seamless. Parents post jobs, tutors apply, and payments are securely processed—ensuring a smooth learning experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-xl-3 col-lg-2">
            <div className="fun-fact-style-two">
              <div className="fun-fact">
                <div className="counter">
                  <div className="timer" data-to="5000" data-speed="3000">5000</div>
                  <div className="operator">+</div>
                </div>
                <span className="medium">Successful Matches</span>
              </div>
              <div className="fun-fact">
                <div className="counter">
                  <div className="timer" data-to="300" data-speed="3000">300</div>
                  <div className="operator">+</div>
                </div>
                <span className="medium">Verified Tutors</span>
              </div>
            </div>
          </div>
          <div className="col-xl-9 col-lg-10 pl-80 pl-md-15 pl-xs-15">
            <div className="feature-style-three-items">
              <div className="row">
                {/* Single Item */}
                <div className="col-lg-4 col-md-6">
                  <div className="feature-style-three-item animate" data-animate="fadeInUp">
                    <img src="assets/img/icon/30.png" alt="Image Not Found" />
                    <h4>Secure Payments</h4>
                    <p>
                      Parents pay upfront, and tutors receive payments only after approval—ensuring a fair and transparent process.
                    </p>
                    <a href="#">Learn More <i className="fas fa-angle-right"></i></a>
                  </div>
                </div>
                {/* End Single Item */}
                {/* Single Item */}
                <div className="col-lg-4 col-md-6">
                  <div className="feature-style-three-item animate" data-animate="fadeInUp" data-delay="100ms">
                    <img src="assets/img/icon/31.png" alt="Image Not Found" />
                    <h4>Verified Tutors</h4>
                    <p>
                      Our tutors go through a strict verification process to ensure quality education for your child.
                    </p>
                    <a href="#">Learn More <i className="fas fa-angle-right"></i></a>
                  </div>
                </div>
                {/* End Single Item */}
                {/* Single Item */}
                <div className="col-lg-4 col-md-6">
                  <div className="feature-style-three-item animate" data-animate="fadeInUp" data-delay="200ms">
                    <img src="assets/img/icon/32.png" alt="Image Not Found" />
                    <h4>Easy Job Matching</h4>
                    <p>
                      Post a job, get applications, and hire the best tutor—all in a few clicks.
                    </p>
                    <a href="#">Learn More <i className="fas fa-angle-right"></i></a>
                  </div>
                </div>
                {/* End Single Item */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
