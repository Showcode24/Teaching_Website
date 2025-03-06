import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './loader.css';
const Loader = () => {
  return (
    <div className="loader-container">
      <DotLottieReact
        src="https://lottie.host/37dea122-b1e3-4dd1-84cf-4b6e5b40f281/OIriNjufRW.lottie"
        loop
        autoplay
        style={{ width: '200px', height: '200px' }}
      />
    </div>
  );
};

export default Loader;
