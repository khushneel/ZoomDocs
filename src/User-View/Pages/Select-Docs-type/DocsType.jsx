import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import SideBarCom from "../../Component/SideBar";
import { getDocumentTypes, helpMeDecide } from "../../User-View-Api";
import toast from 'react-hot-toast';
import "./DocsType.css";

export default function DocsType() {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState("Select");
  const [selectedTypeLabel, setselectedTypeValue] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("Select");
  const [documentTypes, setDocumentTypes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHelpBox, setShowHelpBox] = useState(false);
  const [situation, setSituation] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
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
        toast.error("Failed to load document types. Please refresh the page.");
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
  };

  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
    setShowFormatDropdown(false);
  };

  const handleDeploy = () => {
    if (selectedType === "Select" || selectedFormat === "Select") {
      toast.error("Please select both document type and output format.");
      return;
    }
    setIsGenerating(true);

    // Simulate generation process
    setTimeout(() => {
      // Navigate to the selected document type's template page
      navigate(`/${selectedTypeLabel}/Template`);
      setIsGenerating(false);
    }, 2000);
  };

  const handleAvatarClick = () => {
    navigate("/SignUp");
  };

  const handleAiDecision = async () => {
    if (!situation.trim() || !expectedOutcome.trim()) {
      toast.error("Please fill in both fields before using AI decision.");
      return;
    }

    setIsDeciding(true);

    try {
      // Get auth data from localStorage
      const zoomdocs_auth_id = localStorage.getItem("zoomdocs_auth_id");
      const zoomdocs_user_id = localStorage.getItem("zoomdocs_user_id");

      if (!zoomdocs_auth_id || !zoomdocs_user_id) {
        toast.error("User authentication required. Please refresh the page.");
        setIsDeciding(false);
        return;
      }

      const help_me_decide_inputs = {
        describe_the_situation: situation,
        what_do_you_expect: expectedOutcome,
      };

      console.log('Making AI decision request with:', {
        zoomdocs_auth_id,
        zoomdocs_user_id,
        help_me_decide_inputs
      });

      const response = await helpMeDecide(
        zoomdocs_auth_id,
        zoomdocs_user_id,
        help_me_decide_inputs
      );

      console.log('AI Decision Response:', response.data);
      
      // Store recommendations data
      setAiRecommendations(response.data.recommendations);
      setShowRecommendations(true);
      
      // Process the response and auto-select recommended document type
      if (response.data && response.data.recommendations && response.data.recommendations.document_type) {
        const recommendedDocType = response.data.recommendations.document_type;
        
        // Find exact match first
        let recommendedType = documentTypes.find(
          type => type.value === recommendedDocType
        );
        
        // If no exact match, try to find similar matches
        if (!recommendedType) {
          recommendedType = documentTypes.find(
            type => type.value.includes(recommendedDocType) || 
                   recommendedDocType.includes(type.value) ||
                   type.label.toLowerCase().includes(recommendedDocType.replace('_', ' ')) ||
                   recommendedDocType.replace('_', ' ').includes(type.label.toLowerCase())
          );
        }
        
        if (recommendedType) {
          handleTypeSelect(recommendedType);
          console.log(`Auto-selected document type: ${recommendedType.label} (${recommendedType.value})`);
        } else {
          console.log(`No matching document type found for recommendation: ${recommendedDocType}`);
        }
      }

      // Show success message with justification if available
      const justification = response.data?.recommendations?.justification || 'AI recommendation completed.';
      toast.success(`AI Recommendation: ${justification}`);
      
      // Don't auto-close - let user manually close
      // setTimeout(() => {
      //   setShowRecommendations(false);
      //   setShowHelpBox(false);
      //   setAiRecommendations(null);
      // }, 5000);
      
    } catch (err) {
      console.error("AI Decision Error:", err);
      toast.error("Failed to get AI recommendation. Please try again.");
    } finally {
      setIsDeciding(false);
    }
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
            <div className="form-row-space-between">
              <label className="form-label-inline">
                <i className="fas fa-file-alt"></i>
                Select document type
                <span className="required">*</span>
              </label>
              <button
                type="button"
                className="help-me-decide-btn"
                onClick={() => setShowHelpBox((prev) => !prev)}
              >
                Help me decide
              </button>
            </div>
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

            <button
              className={`deploy-btn ${isGenerating ? "generating" : ""}`}
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
        {showHelpBox && (
          <div className="Help-me-decide-box">
            {!showRecommendations ? (
              <>
                <h2 className="help-title">ZoomDocs AI</h2>
                <p className="help-desc-main">
                  Not sure what document you need for your situation?
                </p>
                <p className="help-desc-sub">
                  ZoomDocs AI will help you decide!
                </p>
                <div className="help-form-fields">
                  <label className="help-label">Describe your situation</label>
                  <input
                    type="text"
                    className="input-field"
                    value={situation}
                    onChange={e => setSituation(e.target.value)}
                    placeholder="E.g. I need a contract for freelance work..."
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="sentences"
                  />
                  <label className="help-label">What do you expect the outcome from this document should be?</label>
                  <input
                    type="text"
                    className="input-field"
                    value={expectedOutcome}
                    onChange={e => setExpectedOutcome(e.target.value)}
                    placeholder="E.g. Ensure payment terms are clear..."
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="sentences"
                  />
                </div>
                <button
                  className={`deploy-btn help-ai-btn ${isDeciding ? "generating" : ""}`}
                  onClick={handleAiDecision}
                  disabled={isDeciding}
                >
                  {isDeciding ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>AI is analyzing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-brain"></i>
                      <span>DECIDE USING AI</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="ai-recommendations">
                <div className="recommendation-header">
                  <div className="ai-icon">
                    <i className="fas fa-brain"></i>
                  </div>
                  <h2 className="recommendation-title">AI Recommendation</h2>
                  <div className="success-badge">
                    <i className="fas fa-check-circle"></i>
                    <span>Analysis Complete</span>
                  </div>
                </div>
                
                {aiRecommendations && (
                  <div className="recommendation-content">
                    <div className="recommended-document">
                      <div className="document-type-badge">
                        <i className="fas fa-file-contract"></i>
                        <span className="document-type-name">
                          {aiRecommendations.document_type ? 
                            aiRecommendations.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                            'Document Type'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="justification-section">
                      <h3 className="justification-title">
                        <i className="fas fa-lightbulb"></i>
                        Why this document?
                      </h3>
                      <p className="justification-text">
                        {aiRecommendations.justification || 'AI recommendation analysis completed.'}
                      </p>
                    </div>
                    
                    <div className="recommendation-actions">
                      <div className="auto-selection-note">
                        <i className="fas fa-magic"></i>
                        <span>Document type has been automatically selected for you!</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="recommendation-footer">
                  <button 
                    className="close-recommendation-btn"
                    onClick={() => {
                      setShowRecommendations(false);
                      setShowHelpBox(false);
                      setAiRecommendations(null);
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
