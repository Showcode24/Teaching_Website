const TestimonialSection = () => {
  return (
    <div className="testimonial-style-two-area text-center default-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <div className="testimonial-style-two-carousel swiper">
              <div className="testimonials-quote">
                <i className="fas fa-quote-right"></i>
              </div>
              <div className="swiper-wrapper">
                {/* Single Item */}
                <div className="swiper-slide">
                  <div className="testimonial-style-two">
                    <div className="tm-reivew">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <h4>Excellent Tutoring Experience!</h4>
                    <p>
                      "Kopa 360 connected us with an amazing tutor for my child. The process was simple, and my child’s grades have improved significantly. I highly recommend the platform for parents looking for quality education."
                    </p>
                  </div>
                </div>
                {/* End Single Item */}
                {/* Single Item */}
                <div className="swiper-slide">
                  <div className="testimonial-style-two">
                    <div className="tm-reivew">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <h4>Great Platform for Tutors!</h4>
                    <p>
                      "As a tutor, Kopa 360 made it incredibly easy to connect with students. The communication is seamless, and the platform provides a great experience for both tutors and parents."
                    </p>
                  </div>
                </div>
                {/* End Single Item */}
                {/* Single Item */}
                <div className="swiper-slide">
                  <div className="testimonial-style-two">
                    <div className="tm-reivew">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <h4>Best Tutoring Service!</h4>
                    <p>
                      "Kopa 360 provides the best tutoring services! The ease of finding quality tutors and the ability to track my child's progress has been a game changer. I am extremely satisfied."
                    </p>
                  </div>
                </div>
                {/* End Single Item */}
              </div>
              {/* Add Arrows */}
            </div>

            <div className="testimonial-bullet swiper">
              <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <div className="swiper-bullet-item">
                    <img src="assets/img/image-10.jpg" alt="Image Not Found" />
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="swiper-bullet-item">
                    <img src="assets/img/image-11.jpg" alt="Image Not Found" />
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="swiper-bullet-item">
                    <img src="assets/img/image-12.jpg" alt="Image Not Found" />
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

export default TestimonialSection;
