// LoadingComponent.jsx
import React from 'react';
import { useLoading } from '../../../contexts/LoadingContext';
import './LoadingComponent.scss';
import cfLogo from "../../../assets/images/cf-logo.png";
import departmentLogo from "../../../assets/images/dapartmentLogo.png";


const LoadingComponent = () => {
  const { loading, loadingMessage } = useLoading();
  const text = loadingMessage || "Compensation Fund";
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!loading) return;
    
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % text.length);
    }, 200);
    
    return () => clearInterval(interval);
  }, [loading, text.length]);

  if (!loading) return null;

  return (
    <div className="main-loading-container">
        <div className="imagesConatiner">
            <img src={cfLogo} alt="cf-logo" />
            <img src={departmentLogo} alt="DoL-logo" />
        </div>
        <div className="text-loader">
            {text.split('').map((char, index) => (
            <span 
                key={index}
                className={`char ${index === activeIndex ? 'active' : ''}`}
                style={{ 
                transform: `rotate(${index === activeIndex ? '360deg' : '0deg'})`,
                transition: 'transform 0.3s ease, color 0.3s ease'
                }}
            >
                {char === ' ' ? '\u00A0' : char}
            </span>
            ))}
        </div>
    </div>
  );
};

export default LoadingComponent;