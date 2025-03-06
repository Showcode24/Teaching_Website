const BlogSection = () => {
  return (
    <div id="blog" className="blog-area home-blog default-padding bg-gray bottom-less">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <div className="site-heading text-center">
              <h4 className="sub-title">
                <img src="assets/img/icon/home-3.png" alt="Image Not Found" />
                News & Blog
              </h4>
              <h2 className="title split-text">Our Latest News & Blog</h2>
            </div>
          </div>
        </div>
        <div className="row">
          {/* Single Item */}
          <div className="col-xl-4 col-md-6 col-lg-6 mb-30">
            <div className="home-blog-style-one-item animate" data-animate="fadeInUp">
              <img src="assets/img/image-14.jpg" alt="Image not Found" />
              <div className="content">
                <div className="info">
                  <ul className="home-blog-meta">
                    <li>
                      <a href="#">Education</a>
                    </li>
                    <li>July 24, 2024</li>
                  </ul>
                  <h4 className="blog-title">
                    <a href="blog-single-with-sidebar.html">How Kopa 360 Helps Parents Find the Best Tutors</a>
                  </h4>
                  <a href="blog-single-with-sidebar.html" className="btn-read-more">
                    Read More <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* End Single Item */}
          {/* Single Item */}
          <div className="col-xl-4 col-md-6 col-lg-6 mb-30">
            <div className="home-blog-style-one-item animate" data-animate="fadeInUp" data-delay="100ms">
              <img src="assets/img/image-15.jpg" alt="Image not Found" />
              <div className="content">
                <div className="info">
                  <ul className="home-blog-meta">
                    <li>
                      <a href="#">Tips</a>
                    </li>
                    <li>October 18, 2024</li>
                  </ul>
                  <h4 className="blog-title">
                    <a href="blog-single-with-sidebar.html">Top 5 Tips for Tutors to Improve Their Online Sessions</a>
                  </h4>
                  <a href="blog-single-with-sidebar.html" className="btn-read-more">
                    Read More <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* End Single Item */}
          {/* Single Item */}
          <div className="col-xl-4 col-md-6 col-lg-6 mb-30">
            <div className="home-blog-style-one-item animate" data-animate="fadeInUp" data-delay="200ms">
              <img src="assets/img/image-16.jpg" alt="Image not Found" />
              <div className="content">
                <div className="info">
                  <ul className="home-blog-meta">
                    <li>
                      <a href="#">Platform Updates</a>
                    </li>
                    <li>August 26, 2024</li>
                  </ul>
                  <h4 className="blog-title">
                    <a href="blog-single-with-sidebar.html">New Features in Kopa 360 to Enhance the Tutoring Experience</a>
                  </h4>
                  <a href="blog-single-with-sidebar.html" className="btn-read-more">
                    Read More <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* End Single Item */}
        </div>
      </div>
    </div>
  );
};

export default BlogSection;
