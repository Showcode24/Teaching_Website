import React, { useState } from 'react';

const NewsletterSection = () => {
  const [email, setEmail] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here (e.g., send email to a backend or a newsletter service)
    console.log('Email submitted:', email);
  };

  return (
    <div
      className="newsletter-area text-light"
      style={{
        backgroundColor: '#041F2A',
        backgroundImage: 'url(assets/img/shape/49.png)',
      }}
    >

      <div className="container">
        <div className="row">
          <div className="col-lg-8 offset-lg-4">
            <div className="newsletter-subscribe">
              <h3>Subscribe to Newsletter</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="form-control"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSection;
