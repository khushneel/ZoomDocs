import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import "./about.css";

export default function About() {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    const handleBackHome = () => {
        navigate("/");
    };

    return (
        <div className={`about-layout ${isDarkMode ? "" : "light-mode"}`}>
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
                    <i className={`fas fa-moon theme-icon ${isDarkMode ? "active" : ""}`}></i>
                    <i className={`fas fa-sun theme-icon ${!isDarkMode ? "active" : ""}`}></i>
                </div>
            </div>

                <div className="about-container">
                    {/* Header Section */}
                    <div className="about-header">
                        <div className="brand-section">
                            <div className="logo-container">
                                <i className="fas fa-file-contract"></i>
                            </div>
                            <h1 className="brand-title">ZoomDocs</h1>
                            <p className="brand-subtitle">AI-Powered Legal Document Generation</p>
                        </div>
                        <button className="back-btn" onClick={handleBackHome}>
                            <i className="fas fa-arrow-left"></i>
                            Back to Home
                        </button>
                    </div>

                    {/* What is ZoomDocs Section */}
                    <div className="about-section">
                        <div className="section-header">
                            <i className="fas fa-info-circle"></i>
                            <h2>What is ZoomDocs?</h2>
                        </div>
                        <div className="content-card">
                            <p className="lead-text">
                                ZoomDocs is an AI-powered platform designed to simplify the creation of legal documents 
                                for individuals and small businesses. It enables users to generate clean, legally sound 
                                documents instantly, without requiring legal expertise, prompt engineering, or interactions with lawyers.
                            </p>
                            
                            <div className="feature-grid">
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <i className="fas fa-robot"></i>
                                    </div>
                                    <h3>AI-Powered Generation</h3>
                                    <p>Unlike general AI tools like ChatGPT, ZoomDocs uses structured, guided interfaces with prebuilt templates.</p>
                                </div>
                                
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <i className="fas fa-list-check"></i>
                                    </div>
                                    <h3>Guided Process</h3>
                                    <p>Form fields and scenario-based flows ensure consistency and ease of use for non-technical users.</p>
                                </div>
                                
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <i className="fas fa-file-alt"></i>
                                    </div>
                                    <h3>Common Documents</h3>
                                    <p>Focus on essential document types: NDAs, contracts, privacy policies, notices, and more.</p>
                                </div>
                                
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <i className="fas fa-download"></i>
                                    </div>
                                    <h3>Quick Export</h3>
                                    <p>Zero learning curve with instant exports to PDF or Word formats.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How It Helps Section */}
                    <div className="about-section">
                        <div className="section-header">
                            <i className="fas fa-hands-helping"></i>
                            <h2>How It Helps You</h2>
                        </div>
                        <div className="content-card">
                            <div className="help-categories">
                                <div className="category-card">
                                    <div className="category-header">
                                        <i className="fas fa-route"></i>
                                        <h3>Guided & Structured Process</h3>
                                    </div>
                                    <p>Instead of a blank chat box that can lead to decision fatigue, ZoomDocs offers scenario cards and guided Q&A interfaces. Select real-world needs like "Hire a freelancer" and get walked through simple questions.</p>
                                </div>

                                <div className="category-card">
                                    <div className="category-header">
                                        <i className="fas fa-clock"></i>
                                        <h3>Time & Cost Savings</h3>
                                    </div>
                                    <p>Quickly fill in fields and get export-ready documents in seconds. Perfect for users who repeatedly need the same 3-5 document types, with auto-saved profiles for reusing common business details.</p>
                                </div>

                                <div className="category-card">
                                    <div className="category-header">
                                        <i className="fas fa-shield-check"></i>
                                        <h3>Confidence & Control</h3>
                                    </div>
                                    <p>Pre-trained logic and conservative, formal language produce consistent, editable previews. Inline help, suggestions, and validation make non-technical users feel in control.</p>
                                </div>

                                <div className="category-card">
                                    <div className="category-header">
                                        <i className="fas fa-dollar-sign"></i>
                                        <h3>Affordable Access</h3>
                                    </div>
                                    <p>Free tier allows 3 documents per month. Pro tiers ($9–19/month) offer unlimited access, team sharing, and advanced exports - perfect for sole proprietors and gig workers.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Target Users Section */}
                    <div className="about-section">
                        <div className="section-header">
                            <i className="fas fa-users"></i>
                            <h2>Perfect For</h2>
                        </div>
                        <div className="content-card">
                            <div className="users-grid">
                                <div className="user-badge">
                                    <i className="fas fa-building"></i>
                                    <span>SMEs</span>
                                </div>
                                <div className="user-badge">
                                    <i className="fas fa-user-tie"></i>
                                    <span>Freelancers</span>
                                </div>
                                <div className="user-badge">
                                    <i className="fas fa-store"></i>
                                    <span>Sole Proprietors</span>
                                </div>
                                <div className="user-badge">
                                    <i className="fas fa-laptop"></i>
                                    <span>Gig Workers</span>
                                </div>
                                <div className="user-badge">
                                    <i className="fas fa-coins"></i>
                                    <span>Crypto/Web3</span>
                                </div>
                                <div className="user-badge">
                                    <i className="fas fa-user-friends"></i>
                                    <span>Non-Technical Users</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer Section */}
                    <div className="about-section disclaimer-section">
                        <div className="section-header">
                            <i className="fas fa-exclamation-triangle"></i>
                            <h2>Important Disclaimer</h2>
                        </div>
                        <div className="disclaimer-card">
                            <p>
                                ZoomDocs is an AI tool intended for generating general legal documents based on user inputs and prebuilt templates. 
                                <strong> It is not a substitute for professional legal advice</strong>, and users should consult qualified attorneys 
                                for specific legal matters, complex situations, or jurisdiction-specific requirements.
                            </p>
                            <p>
                                The platform aims to provide consistent and trustworthy outputs but cannot guarantee legal validity in all cases, 
                                as laws vary by location and circumstance. <strong>Use at your own risk</strong>, and verify all generated documents before application.
                            </p>
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="about-footer">
                        <div className="footer-content">
                            <div className="company-info">
                                <p className="designed-by">
                                    <i className="fas fa-palette"></i>
                                    Designed by <strong>Misfit Makes IO</strong>
                                </p>
                                <div className="footer-links">
                                    <button className="footer-link" onClick={handleBackHome}>
                                        <i className="fas fa-home"></i>
                                        Generate Documents
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}