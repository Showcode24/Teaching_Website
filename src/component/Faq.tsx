const FAQSection = () => {
  return (
    <div className="faq-style-one-area bg-gray default-padding">
      <div className="container">
        <div className="faq-style-one-items">
          <div className="row align-center">
            <div className="col-xl-7">
              <div className="faq-content">
                <h4 className="sub-title">
                  <img src="assets/img/icon/home-3.png" alt="Image Not Found" /> Frequently Asked Questions
                </h4>
                <h2 className="title split-text">Got Questions About Kopa 360?</h2>
                <div className="accordion accordion-style-one" id="faqAccordion">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseOne"
                        aria-expanded="true"
                        aria-controls="collapseOne"
                      >
                        How do I post a tutoring job on Kopa 360?
                      </button>
                    </h2>
                    <div
                      id="collapseOne"
                      className="accordion-collapse collapse show"
                      aria-labelledby="headingOne"
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        <p>
                          Posting a tutoring job on Kopa 360 is simple. Just sign up as a parent, navigate to the job posting section, and fill out the required details. Once submitted, tutors will be able to apply for the job, and you can choose the best fit for your child’s needs.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingTwo">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseTwo"
                        aria-expanded="false"
                        aria-controls="collapseTwo"
                      >
                        How do I select the right tutor for my child?
                      </button>
                    </h2>
                    <div
                      id="collapseTwo"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingTwo"
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        <p>
                          You can review the tutors' profiles, including their qualifications, experience, and reviews from other parents. Once you've selected a tutor, you can initiate the hiring process and get started with lessons.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingThree">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseThree"
                        aria-expanded="false"
                        aria-controls="collapseThree"
                      >
                        How are payments handled on Kopa 360?
                      </button>
                    </h2>
                    <div
                      id="collapseThree"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingThree"
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        <p>
                          Payments are made to Kopa 360, and we securely process them on behalf of both parents and tutors. At the end of each month, parents approve the tutor for payment, ensuring a smooth and reliable transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-5 faq-thumb">
              <img src="assets/img/image-8.jpg" alt="Image Not Found" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
