import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import SideBarCom from "../Component/SideBar";
import { getGeneratedDocument } from "../User-View-Api";
import "./RecentDocsView.css";

export default function RecentDocsView() {
    const location = useLocation();
    const { filePath } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const originalDocumentData = location.state?.originalDocumentData;
    const { isDarkMode, sidebarCollapsed, toggleTheme, toggleSidebar } = useTheme();
    
    // Get auth data from Redux store
    const {
        zoomdocs_auth_id: reduxAuthId,
        zoomdocs_user_id: reduxUserId,
    } = useSelector((state) => state.user);
    
    // Component state
    const [htmlContent, setHtmlContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get auth data from localStorage as fallback
    const getAuthFromStorage = () => {
        const authId = reduxAuthId || localStorage.getItem("zoomdocs_auth_id");
        const userId = reduxUserId || localStorage.getItem("zoomdocs_user_id");
        return { authId, userId };
    };

    useEffect(() => {
        // Log the received original document data
        console.log('RecentDocsView - File Path from URL:', filePath);
        console.log('RecentDocsView - originalDocumentData from state:', originalDocumentData);
        
        // If no document data is available, navigate to home
        if (!originalDocumentData) {
            console.log("[RecentDocsView] No document data available, navigating to home");
            navigate("/");
            return;
        }
        
        // Fetch HTML content if document data is available
        if (originalDocumentData && originalDocumentData.file_path_html) {
            fetchHtmlContent();
        }
    }, [filePath, originalDocumentData, navigate]);

    const fetchHtmlContent = async () => {
        if (!originalDocumentData || !originalDocumentData.file_path_html) {
            console.log("[RecentDocsView] No file path HTML available");
            return;
        }

        const { authId, userId } = getAuthFromStorage();
        
        if (!authId || !userId) {
            setError("Authentication credentials not found");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Extract filename with .html extension from the full file path
            const fullFilePath = originalDocumentData.file_path_html;
            const htmlFileName = fullFilePath.split('/').pop(); // Get last part of path (filename.html)
            
            console.log("[RecentDocsView] Full file path:", fullFilePath);
            console.log("[RecentDocsView] Extracted HTML filename:", htmlFileName);
            console.log("[RecentDocsView] Fetching HTML content for:", htmlFileName);
            
            const response = await getGeneratedDocument(
                "html", 
                htmlFileName, 
                authId, 
                userId
            );

            console.log("[RecentDocsView] HTML API response:", response);

            if (response.status === 200 && response.data instanceof Blob) {
                const htmlText = await response.data.text();
                console.log("[RecentDocsView] HTML content loaded successfully");
                setHtmlContent(htmlText);
            } else {
                console.error("[RecentDocsView] Invalid response format");
                setError("Failed to load document content");
            }
        } catch (err) {
            console.error("[RecentDocsView] Error fetching HTML content:", err);
            setError("Failed to load document content");
        } finally {
            setIsLoading(false);
        }
    };

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
                                    {isLoading ? (
                                        <div className="preview-placeholder">
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            <h4>Loading Document...</h4>
                                            <p>Please wait while we load your document.</p>
                                        </div>
                                    ) : error ? (
                                        <div className="preview-placeholder">
                                            <i className="fa-solid fa-exclamation-triangle"></i>
                                            <h4>Error Loading Document</h4>
                                            <p>{error}</p>
                                            <button 
                                                className="retry-btn" 
                                                onClick={fetchHtmlContent}
                                                style={{
                                                    marginTop: '1rem',
                                                    padding: '0.5rem 1rem',
                                                    background: 'var(--primary-color)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <i className="fa-solid fa-refresh"></i> Retry
                                            </button>
                                        </div>
                                    ) : htmlContent ? (
                                        <iframe 
                                            srcDoc={htmlContent}
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