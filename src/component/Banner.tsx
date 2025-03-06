const Banner = () => {
  return (
    <div className="banner-style-four-area bg-dark text-light">

      <div className="banner-style-four-thumb" style={{ backgroundImage: 'url(assets/img/image_20.png)' }}>
        {/* <div className="video-btn">
          <a href="https://www.youtube.com/watch?v=3ctoSEQsY54" className="popup-youtube">
            <i className="fas fa-play"></i>
          </a>
        </div> */}
      </div>
      <div className="banner-move-animation">
        <img src="assets/img/shape/15.png" alt="Image Not Found" />
        <img src="assets/img/shape/16.png" alt="Image Not Found" />
        <img src="assets/img/shape/17.png" alt="Image Not Found" />
        <img src="assets/img/shape/18.png" alt="Image Not Found" />
      </div>
      <div className="banner-style-four">
        <div className="container">
          <div className="row align-center">
            <div className="col-lg-6 pr-50 pr-md-15 pr-xs-15">
              <div className="banner-four-info">
                <h2>Find the Best <strong>Tutors</strong> for Your Child</h2>
                <p>
                  Kopa 360 connects parents with qualified tutors. Post a job, choose the perfect tutor, and track progress—all in one place.
                </p>
                <div className="button mt-40">
                  {/* <a className="btn btn-theme btn-md animation" href="apply.html">Find a Tutor</a> */}
                  <a className="btn btn-light btn-md animation ml-3" href="/sign-up">Become a Tutor</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
