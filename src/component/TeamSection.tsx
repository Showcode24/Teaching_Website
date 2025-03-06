const teamMembers = [
  {
    name: "Engr. Moshood Ozeto",
    role: "Founder & CEO",
    image: "assets/img/author_4.jpg"
  },
  {
    name: "Arc. Mrs. Cecilia Atohengbe",
    role: "Chief Operations Manager",
    image: "assets/img/author_3.jpg"
  },
  {
    name: "Osunmakinde Oluwaseun",
    role: "Education Consultant",
    image: "assets/img/author_2.jpg"
  }
];

const TeamSection = () => {
  return (
    <div
      className="team-style-two-area default-padding-top bottom-less bg-cover"
      style={{
        backgroundColor: '#041F2A', // Close shade of #062835

      }}
    >

      <div className="container">
        <div className="row">
          <div className="col-xl-3 col-md-6 col-lg-6">
            <h4 className="sub-title">
              <img src="assets/img/icon/home-3.png" alt="Image Not Found" /> Meet Our Tutors
            </h4>
            <h2 className="title split-text text-white">Our Top Educators</h2>
            <a className="btn btn-theme btn-md animation" href="/sign-up">
              Become a Tutor
            </a>
          </div>
          {teamMembers.map((member, index) => (
            <div className="col-xl-3 col-md-6 col-lg-6" key={index}>
              <div className="team-style-two-item">
                <div className="thumb">
                  <img src={member.image} alt="Image Not Found" />
                  <div className="social-overlay">
                    <ul>
                      <li>
                        <a href="#"><i className="fab fa-linkedin-in"></i></a>
                      </li>
                      <li>
                        <a href="#"><i className="fab fa-dribbble"></i></a>
                      </li>
                      <li>
                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                      </li>
                    </ul>
                    <div className="icon">
                      <i className="fas fa-plus"></i>
                    </div>
                  </div>
                </div>
                <div className="team-overlay">
                  <div className="content">
                    <h4><a href="#">{member.name}</a></h4>
                    <span>{member.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamSection;
