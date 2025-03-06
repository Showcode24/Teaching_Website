const ChooseUs = () => {
  return (
    <div
      className="choose-us-style-three-area default-padding"
      style={{ backgroundImage: 'url(assets/img/shape/28.png)' }}
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="choose-us-style-three-info">
              <h4 className="sub-title">
                <img src="assets/img/icon/home-3.png" alt="Image Not Found" /> Why Choose Us
              </h4>
              <h2 className="title split-text">Why Kopa 360 is the best choice for parents and tutors.</h2>
              <ul className="list-style-six mt-40">
                <li className="animate" data-animate="fadeInUp">
                  <span>01</span>
                  <h4>Verified & Qualified Tutors</h4>
                  <p>
                    We ensure all tutors are thoroughly screened and meet high educational standards to provide the best learning experience.
                  </p>
                </li>
                <li className="animate" data-animate="fadeInUp" data-delay="100ms">
                  <span>02</span>
                  <h4>Secure & Hassle-Free Payments</h4>
                  <p>
                    Parents make payments through our secure platform, and tutors receive their earnings only after lesson completion and approval.
                  </p>
                </li>
                <li className="animate" data-animate="fadeInUp" data-delay="200ms">
                  <span>03</span>
                  <h4>Flexible Learning for Every Child</h4>
                  <p>
                    Whether your child needs extra help or wants to excel, we match them with the perfect tutor for their academic goals.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-lg-5 offset-lg-1">
            <div className="choose-us-style-three-thumb">
              <img
                className="animate"
                data-animate="fadeInUp"
                src="assets/img/image-5.jpg"
                alt="Image Not Found"
              />
              <div
                className="card-style-two bg-theme text-light animate"
                data-animate="fadeInRight"
                data-delay="300ms"
              >
                <img src="assets/img/icon/44.png" alt="Image Not Found" />
                <h4>Trusted by Thousands of Parents & Tutors!</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseUs;
