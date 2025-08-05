import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import SideBarCom from "../Component/SideBar";
import "./RecentDocsView.css";

export default function RecentDocsView() {
    const location = useLocation();
    const { filePath } = useParams();
    const navigate = useNavigate();
    const originalDocumentData = location.state?.originalDocumentData;
    const { isDarkMode, sidebarCollapsed, toggleTheme, toggleSidebar } = useTheme();

    useEffect(() => {
        // Log the received original document data
        console.log('RecentDocsView - File Path from URL:', filePath);
        console.log('RecentDocsView - originalDocumentData from state:', originalDocumentData);
        
       
    }, [filePath, originalDocumentData]);

    const handleAvatarClick = () => {
        navigate("/SignUp");
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    return (
        <div className={`dashboard-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${isDarkMode ? "" : "light-mode"}`}>
            <SideBarCom isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            
            <div className="recentdocs-main">
                {/* Header */}
                <div className="recentdocs-header">
                    <div className="header-left">
                        <div className="page-title">
                            <h1>Recent Document</h1>
                            <p>View and manage your generated document</p>
                        </div>
                    </div>
                    
                    <div className="header-right">
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
                        
                        <div className="login-avatar" onClick={handleAvatarClick}>
                            <div className="avatar-container">
                                <div className="avatar-icon">
                                    <i className="fa-solid fa-user"></i>
                                </div>
                                <div className="avatar-text">
                                    <span className="login-text">Login</span>
                                </div>
                            </div>
                            <div className="avatar-glow"></div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="recentdocs-content">
                    {originalDocumentData ? (
                        <div className="document-view-card">
                            {/* Document Header */}
                            <div className="document-header">
                                <div className="document-info">
                                    <div className="document-icon">
                                        <i className="fa-solid fa-file-alt"></i>
                                    </div>
                                    <div className="document-details">
                                        <h2 className="document-title">
                                            {originalDocumentData.document_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </h2>
                                        <div className="document-meta">
                                            <span className="document-type">
                                                <i className="fa-solid fa-tag"></i>
                                                {originalDocumentData.document_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                            <span className="document-date">
                                                <i className="fa-solid fa-calendar"></i>
                                                {new Date(originalDocumentData.generated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document Preview */}
                            <div className="document-preview">
                                <div className="preview-content">
                                    {originalDocumentData.file_path_html ? (
                                        <iframe 
                                            src={`file://${originalDocumentData.file_path_html}`}
                                            title="Document Preview"
                                            className="document-frame"
                                        />
                                    ) : (
                                        <div className="preview-placeholder">
                                            <i className="fa-solid fa-file-alt"></i>
                                            <h4>Preview Not Available</h4>
                                            <p>The document preview could not be loaded.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-document-card">
                            <div className="no-document-icon">
                                <i className="fa-solid fa-file-circle-question"></i>
                            </div>
                            <h2>No Document Found</h2>
                            <p>No document data was provided. Please select a document from the sidebar.</p>
                            <button className="back-home-btn" onClick={handleBackToHome}>
                                <i className="fa-solid fa-home"></i>
                                <span>Back to Home</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}