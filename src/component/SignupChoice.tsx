import { useState } from 'react';
import { User, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SignupChoice() {
  const [selectedOption, setSelectedOption] = useState<'client' | 'freelancer' | null>(null);
  const navigate = useNavigate();
  const handleCreateAccount = () => {
    if (selectedOption) {
      navigate('/Register');
    }
  };
  return (
    <div className="signup-choice-container">
      <h1 className="signup-title">Join as a client or freelancer</h1>

      <div className="choice-cards-container">
        <div
          className={`choice-card ${selectedOption === 'client' ? 'selected' : ''}`}
          onClick={() => setSelectedOption('client')}
        >
          <div className="choice-content">
            <User size={24} className="choice-icon" />
            <h2 className="choice-heading">I'm a client, hiring for a project</h2>
          </div>
          <div className="radio-circle">
            <div className="radio-inner"></div>
          </div>
        </div>

        <div
          className={`choice-card ${selectedOption === 'freelancer' ? 'selected' : ''}`}
          onClick={() => setSelectedOption('freelancer')}
        >
          <div className="choice-content">
            <Briefcase size={24} className="choice-icon" />
            <h2 className="choice-heading">I'm a freelancer, looking for work</h2>
          </div>
          <div className="radio-circle">
            <div className="radio-inner"></div>
          </div>
        </div>
      </div>

      <button
        className={`create-account-btn ${selectedOption ? 'active' : ''}`}
        disabled={!selectedOption}
        onClick={handleCreateAccount}
      >
        Create Account
      </button>

      <div className="login-prompt">
        Already have an account? <a href="/login" className="login-link">Log In</a>
      </div>
    </div>
  );
}