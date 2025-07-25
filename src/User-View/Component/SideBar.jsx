import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAppSelector } from "../../store/hooks";
import { useTheme } from "../../contexts/ThemeContext";
import "./SideBar.css";
import creditsIcon from "../../assets/Icons/Vector (1).png";

export default function SideBarCom({ isCollapsed, onToggle }) {
  const navigate = useNavigate();
  const toggleRef = useRef(null);
  const { credits } = useAppSelector((state) => state.user);
  const { isDarkMode } = useTheme();
  const [isCreditsLoading, setIsCreditsLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading state
    if (credits?.credits !== undefined) {
      setIsCreditsLoading(false);
    }
  }, [credits]);

  const handleToggleClick = () => {
    // Add ripple effect
    if (toggleRef.current) {
      toggleRef.current.classList.add('clicked');
      setTimeout(() => {
        toggleRef.current?.classList.remove('clicked');
      }, 600);
    }
    
    // Call the original toggle function
    onToggle();
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-glow"></div>
      
      <div className="sidebar-header">
        {!isCollapsed ? (
          <img
            src="https://ervjukxdjbtpcfpbhzqh.supabase.co/storage/v1/object/public/zoomdocs-gautam-version//zoomdocs_black_white.png"
            alt="Logo"
            className="sidebar-logo"
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
          />
        ) : (
          <div className="collapsed-logo-container">
            <img
              src="https://ervjukxdjbtpcfpbhzqh.supabase.co/storage/v1/object/public/zoomdocs-gautam-version//zoomdocs_black_white.png"
              alt="Logo"
              className="collapsed-logo"
              onClick={handleLogoClick}
              style={{ cursor: 'pointer' }}
            />
          </div>
        )}
        
        <button 
          ref={toggleRef}
          className="sidebar-toggle" 
          onClick={handleToggleClick}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="sidebar-content">
          <div className="generate-btn">
            <div className="btn-glow"></div>
            <i className="fa-solid fa-plus" style={{ marginRight: "8px" }}></i>
            <span>Generate new document</span>
          </div>
          
          <div className="recents">
            <div className="recents-title">
              <i className="fa-solid fa-clock" style={{ marginRight: "8px" }}></i>
              Recent Documents
            </div>
            <div className="recent-item">
              <div className="recent-dot"></div>
              <span>Rental agreement march 2025</span>
            </div>
            <div className="recent-item">
              <div className="recent-dot"></div>
              <span>Legal notice for tax April - May</span>
            </div>
            <div className="recent-item">
              <div className="recent-dot"></div>
              <span>Rental agreement december 2024</span>
            </div>
          </div>
          
          <div className="credits-card">
            <div className="credits-card-glow"></div>
            <div className="credits-header">
              <img src={creditsIcon} alt="creditsIcon" className="credits-icon" />
              <div className="credits-info">
                <div className="credits-title">Credits remaining</div>
                <div className="credits-count">
                  {isCreditsLoading ? (
                    <div className="credits-spinner"></div>
                  ) : (
                    credits?.credits || 0
                  )}
                </div>
              </div>
            </div>
            <button className="get-more-btn">
              <i className="fa-solid fa-arrow-up" style={{ marginRight: "6px" }}></i>
              Get more
            </button>
          </div>
        </div>
      )}
      
      {isCollapsed && (
        <div className="collapsed-content">
          <div className="vertical-text-container">
            <span className="zoom-text">ZoomDocsAI</span>
          </div>
        </div>
      )}
    </div>
  );
}
