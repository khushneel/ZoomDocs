import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import "./sign-up.css";
import googleIcon from "../../../../src/assets/Icons/ee5e3a94854049ea885b9523ee2a0e736fccbb73.png";

export default function SignUp() {
  const videoRef = useRef(null);
  const navigate = useNavigate(); // Add this hook

  const handleLogoClick = () => {
    navigate('/');
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.01; // Set your desired speed here
    }
  }, []);
  return (
   <section>
     <div className="content-container">
      <div className="signup-container">
        <div className="signup-left">
          <video
            className="signup-bg-video"
            src="https://darbdtgqhhdgvgarjlxf.supabase.co/storage/v1/object/public/zoomdocs-ai-storage//20250711_1048_Purple%20Waves%20Animation_simple_compose_01jzvyqvzbef8r6rx367943emy-vmake.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div></div>

          <div className="testimonial">
            <p>
              With ZoomDocs, I just fill in the details and get a well-drafted
              document instantly. It’s a massive time-saver and a game-changer
              for my business.
            </p>
            <span>Elon Musk</span>
          </div>
        </div>
        <div className="signup-right">
          <div className="login-link">
            <div className="login-flex">
              <img
                src="https://ervjukxdjbtpcfpbhzqh.supabase.co/storage/v1/object/public/zoomdocs-gautam-version//zoomdocs_black_white.png"
                alt="Logo"
                className="logo"
                onClick={handleLogoClick}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <div>
              <a href="#" className="login-text">
                Login
              </a>
            </div>
          </div>

          <div className="form-container">
            <div>
              <h2>Create an account</h2>
              <p>Enter your email below to create your account</p>
            </div>
            <div className="input-feild">
              <input type="email" placeholder="name@example.com" />
              <button>Sign In with Email</button>
            </div>
            <div className="divider">
              <span className="line"></span>
              <span>OR CONTINUE WITH</span>
              <span className="line"></span>
            </div>
            <button className="google-btn">
              <img src={googleIcon} alt="Google" />
              Google
            </button>
            <p className="terms">
              By clicking continue, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
   </section>
  );
}
