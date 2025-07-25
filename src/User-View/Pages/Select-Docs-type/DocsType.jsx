import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SideBarCom from "../../Component/SideBar";
import { getDocumentTypes } from "../../User-View-Api";
import { useTheme } from "../../../contexts/ThemeContext";
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
      className={`dashboard-layout ${isDarkMode ? "dark-mode" : "light-mode"}`}
    >
      <SideBarCom isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="dashboard-main">
        {/* Floating particles background */}
        <div className="particles-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>

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
        {/* 
        <img
          src="https://ervjukxdjbtpcfpbhzqh.supabase.co/storage/v1/object/public/zoomdocs-gautam-version//zoomdocs_black_white.png"
          alt="Logo"
          className="responsive-logo"
        /> */}

        <div className="docstype-card card">
          <div className="card-header">
            <div className="header-glow"></div>
            <h2>
              <span className="gradient-text">Generate Legal Document</span>
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
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
                className={`dropdown-selected input-field ${
                  selectedType !== "Select" ? "selected" : ""
                }`}
                onClick={() => setShowTypeDropdown((prev) => !prev)}
                tabIndex={0}
              >
                {selectedType}
                <span
                  className={`dropdown-arrow ${showTypeDropdown ? "open" : ""}`}
                >
                  <i className="fas fa-chevron-down"></i>
                </span>
              </div>
              {showTypeDropdown && (
                <div className="dropdown-options">
                  {documentTypes.map((type, index) => (
                    <div
                      key={type.value}
                      className="dropdown-option"
                      onClick={() => handleTypeSelect(type)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <i className={type.icon} style={{ marginRight: 8 }}></i>
                      <span>{type.label}</span>
                      <div className="option-hover-effect"></div>
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
                className={`dropdown-selected input-field ${
                  selectedFormat !== "Select" ? "selected" : ""
                }`}
                onClick={() => setShowFormatDropdown((prev) => !prev)}
                tabIndex={0}
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
                <div className="dropdown-options">
                  <div
                    className="dropdown-option"
                    onClick={() => handleFormatSelect("PDF")}
                  >
                    <i
                      className="fas fa-file-pdf"
                      style={{ marginRight: 8, color: "#ff4444" }}
                    ></i>
                    <span>PDF</span>
                    <div className="option-hover-effect"></div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <button
              className={`deploy-btn btn-primary ${
                isGenerating ? "generating" : ""
              }`}
              onClick={handleDeploy}
              disabled={isGenerating}
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
              <div className="btn-shine"></div>
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
    </div>
  );
}
