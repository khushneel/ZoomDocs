import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import SideBarCom from "../../Component/SideBar";
import { getDocumentTypes } from "../../User-View-Api";
import "./DocsType.css";

export default function DocsType() {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState("Select");
  const [selectedTypeLabel, setselectedTypeValue] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("Select");
  const [documentTypes, setDocumentTypes] = useState([]);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const typeDropdownRef = useRef(null);
  const formatDropdownRef = useRef(null);

  // Use theme context
  const { isDarkMode, sidebarCollapsed, toggleTheme, toggleSidebar } =
    useTheme();

  useEffect(() => {
    // Get document types
    getDocumentTypes()
      .then((res) => {
        setDocumentTypes(res.data.documentTypes || []);
      })
      .catch((err) => {
        console.error("API Error:", err);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target)
      ) {
        setShowTypeDropdown(false);
      }
      if (
        formatDropdownRef.current &&
        !formatDropdownRef.current.contains(event.target)
      ) {
        setShowFormatDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTypeSelect = (type) => {
    setSelectedType(type.label);
    setselectedTypeValue(type.value);
    setShowTypeDropdown(false);
    setError("");
  };

  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
    setShowFormatDropdown(false);
    setError("");
  };

  const handleDeploy = () => {
    if (selectedType === "Select" || selectedFormat === "Select") {
      setError("Please select both document type and output format.");
      return;
    }
    setError("");
    setIsGenerating(true);

    // Simulate generation process
    setTimeout(() => {
      const urlDocType = selectedTypeLabel.replace(/\s+/g, "-");
      navigate(`/${urlDocType}`);
      setIsGenerating(false);
    }, 2000);
  };

  const handleAvatarClick = () => {
    navigate("/SignUp");
  };

  return (
    <div
      className={`dashboard-layout ${isDarkMode ? "" : "light-mode"}`}
    >
      <SideBarCom isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className={`dashboard-main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Floating particles background */}
        <div className="particles-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>

        {/* Enhanced Theme Toggle Button */}
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
 

        <div className="docstype-card">
          <div className="card-header">
            <h2>
              <span className="gradient-text">Generate Legal Document</span>
            </h2>
            <p className="subtitle">
              <i className="fas fa-rocket"></i>
              Draft Professional Legal Documents in Seconds with AI
            </p>
          </div>

          <div className="form-section">
            <label>
              <i className="fas fa-file-alt"></i>
              Select document type
              <span className="required">*</span>
            </label>
            <div className="custom-dropdown" ref={typeDropdownRef}>
              <div
                className={`dropdown-selected ${
                  selectedType !== "Select" ? "selected" : ""
                }`}
                onClick={() => setShowTypeDropdown((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-expanded={showTypeDropdown}
                aria-haspopup="listbox"
              >
                {selectedType}
                <span
                  className={`dropdown-arrow ${showTypeDropdown ? "open" : ""}`}
                >
                  <i className="fas fa-chevron-down"></i>
                </span>
              </div>
              {showTypeDropdown && (
                <div className="dropdown-options" role="listbox">
                  {documentTypes.map((type, index) => (
                    <div
                      key={type.value}
                      className="dropdown-option"
                      onClick={() => handleTypeSelect(type)}
                      role="option"
                      tabIndex={0}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <i className={type.icon}></i>
                      <span>{type.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label>
              <i className="fas fa-download"></i>
              Select output format
              <span className="required">*</span>
            </label>
            <div className="custom-dropdown" ref={formatDropdownRef}>
              <div
                className={`dropdown-selected ${
                  selectedFormat !== "Select" ? "selected" : ""
                }`}
                onClick={() => setShowFormatDropdown((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-expanded={showFormatDropdown}
                aria-haspopup="listbox"
              >
                {selectedFormat}
                <span
                  className={`dropdown-arrow ${
                    showFormatDropdown ? "open" : ""
                  }`}
                >
                  <i className="fas fa-chevron-down"></i>
                </span>
              </div>
              {showFormatDropdown && (
                <div className="dropdown-options" role="listbox">
                  <div
                    className="dropdown-option"
                    onClick={() => handleFormatSelect("PDF")}
                    role="option"
                    tabIndex={0}
                  >
                    <i className="fas fa-file-pdf"></i>
                    <span>PDF</span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="error-message" role="alert">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <button
              className={`deploy-btn ${isGenerating ? "generating" : ""}`}
              onClick={handleDeploy}
              disabled={isGenerating}
              aria-describedby={error ? "error-message" : undefined}
            >
              {isGenerating ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i>
                  <span>Generate Document</span>
                </>
              )}
            </button>
          </div>

          <div className="card-footer">
            <div className="security-badge">
              <i className="fas fa-shield-check"></i>
              <span>256-bit SSL Encrypted</span>
            </div>
            <div className="ai-badge">
              <i className="fas fa-brain"></i>
              <span>AI Powered</span>
            </div>
          </div>
        </div>

        <div
          className="login-avatar"
          onClick={handleAvatarClick}
          title="Sign In / Sign Up"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleAvatarClick();
            }
          }}
        >
          <div className="avatar-container">
            <div className="avatar-icon">
              <i className="fas fa-user"></i>
            </div>
            <div className="avatar-text">Login</div>
          </div>
        </div>
      </div>
    </div>
  );
}
