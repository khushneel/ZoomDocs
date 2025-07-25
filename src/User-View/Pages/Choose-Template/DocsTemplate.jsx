import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDocumentTemplateByType } from "../../User-View-Api";
import SideBarCom from "../../Component/SideBar";
import { useTheme } from "../../../contexts/ThemeContext";
import "./DocsTemplate.css";

export default function DocsTemplate() {
  const { docstype } = useParams();
  const query = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();
  const { isDarkMode, sidebarCollapsed, toggleTheme, toggleSidebar } =
    useTheme();

  // Convert hyphens or spaces to underscores for API
  const formattedDocstype = decodeURIComponent(docstype).replace(/-| /g, "_");

  const [templateData, setTemplateData] = useState(null);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    getDocumentTemplateByType(formattedDocstype)
      .then((res) => setTemplateData(res.data))
      .catch((err) => setError("Failed to fetch template: " + err.message));
  }, [formattedDocstype]);

  const handleProceed = () => {
    if (activeIndex === null) {
      setError("Please Choose Demand Letter Template");
    } else {
      setError("");
      navigate(`/${docstype}/Template`);
    }
  };
  const handleAvatarClick = () => {
    navigate("/SignUp");
  };

  return (
    <div
      className={`dashboard-layout ${isDarkMode ? "dark-mode" : "light-mode"}`}
    >
      <SideBarCom isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Professional Theme Toggle Button */}
      <div
        className="theme-toggle"
        onClick={toggleTheme}
        title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      >
        <div className="theme-toggle-slider">
          <i className={`fas ${isDarkMode ? "fa-moon" : "fa-sun"}`}></i>
        </div>
        <div className="theme-toggle-track">
          <i
            className={`fas fa-moon theme-icon ${isDarkMode ? "active" : ""}`}
          ></i>
          <i
            className={`fas fa-sun theme-icon ${!isDarkMode ? "active" : ""}`}
          ></i>
        </div>
      </div>

      <div className="choose-template-main">
        <div className="choose-template-header-row">
          <div>
            <h2 className="choose-template-title">
              Choose Demand Letter Template
            </h2>
            <p className="choose-template-subtitle">
              Select a template that best fits your needs.
            </p>
          </div>
        </div>
        {error && (
          <div className="choose-template-error error-message">{error}</div>
        )}
        <div className="template-grid">
          {[1, 2, 3, 4, 5].map((i, idx) => (
            <div
              className={`template-card card${
                activeIndex === idx ? " active" : ""
              }`}
              key={i}
              onClick={() => {
                if (activeIndex === idx) {
                  setActiveIndex(null);
                } else {
                  setActiveIndex(idx);
                }
                setError("");
              }}
            >
              <div
                className={`template-card-image${
                  activeIndex === idx ? " active" : ""
                }`}
              ></div>
              <div className="template-card-header text-primary">
                Template {i} Header
              </div>
              <div className="template-card-subtitle text-secondary">
                Professional template for legal documents with modern styling
              </div>
            </div>
          ))}
        </div>
          <button
            className={`proceed-btn btn-primary${
              activeIndex !== null ? " active" : ""
            }`}
            onClick={handleProceed}
            type="button"
          >
            <i
              className="fas fa-arrow-right"
              style={{ marginRight: "8px" }}
            ></i>
            Proceed
          </button>
      </div>

      <div
        className="login-avatar"
        onClick={handleAvatarClick}
        title="Sign In / Sign Up"
      >
        <div className="avatar-container">
          <div className="avatar-icon">
            <i className="fas fa-user"></i>
          </div>
          <div className="avatar-text">
            <span className="login-text">Login</span>
          </div>
        </div>
        <div className="avatar-glow"></div>
      </div>
    </div>
  );
}
