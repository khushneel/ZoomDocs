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
  const { isDarkMode, sidebarCollapsed, toggleTheme, toggleSidebar } =
    useTheme();

  // Get auth data from Redux store
  const { zoomdocs_auth_id: reduxAuthId, zoomdocs_user_id: reduxUserId } =
    useSelector((state) => state.user);

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
    console.log("RecentDocsView - File Path from URL:", filePath);
    console.log(
      "RecentDocsView - originalDocumentData from state:",
      originalDocumentData
    );

    // If no document data is available, navigate to home
    if (!originalDocumentData) {
      console.log(
        "[RecentDocsView] No document data available, navigating to home"
      );
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
      const htmlFileName = fullFilePath.split("/").pop(); // Get last part of path (filename.html)

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

  const handleDownloadPDF = async () => {
    if (!htmlContent) {
      console.log(
        "[RecentDocsView] No HTML content available for PDF generation"
      );
      return;
    }

    try {
      console.log("[RecentDocsView] Generating PDF from HTML content...");

      // Dynamically import html2pdf library
      const html2pdf = await import(
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
      );

      // Create a temporary div with the HTML content
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = `
                <div style="
                    font-family: 'Times New Roman', serif;
                    background-color: white;
                    color: black;
                    margin: 0;
                    padding: 0;
                    line-height: 1.4;
                    width: 100%;
                    box-sizing: border-box;
                    font-size: 14px;
                ">
                    ${htmlContent}
                </div>
            `;

      // Hide any download buttons from the content
      const buttons = tempDiv.querySelectorAll(
        "button, .download-container, .download-btn"
      );
      buttons.forEach((btn) => (btn.style.display = "none"));

      // Make images very compact
      const images = tempDiv.querySelectorAll("img");
      images.forEach((img) => {
        img.style.maxWidth = "120px";
        img.style.height = "60px";
        img.style.display = "block";
        img.style.margin = "5px auto";
        img.style.pageBreakInside = "avoid";
        img.style.pageBreakAfter = "avoid";
      });

      // Make headers very compact
      const headers = tempDiv.querySelectorAll(".header");
      headers.forEach((header) => {
        header.style.textAlign = "center";
        header.style.marginBottom = "8px";
        header.style.marginTop = "0px";
        header.style.pageBreakAfter = "avoid";
        header.style.pageBreakInside = "avoid";
        header.style.height = "auto";
      });

      // Ultra compact container
      const containers = tempDiv.querySelectorAll(".container");
      containers.forEach((container) => {
        container.style.padding = "8px";
        container.style.margin = "0";
        container.style.maxWidth = "100%";
        container.style.pageBreakInside = "avoid";
      });

      // Compact date section
      const dates = tempDiv.querySelectorAll(".date");
      dates.forEach((date) => {
        date.style.marginBottom = "8px";
        date.style.marginTop = "0px";
        date.style.pageBreakAfter = "avoid";
        date.style.fontSize = "14px";
      });

      // Compact document body
      const docBodies = tempDiv.querySelectorAll(".document-body");
      docBodies.forEach((body) => {
        body.style.marginTop = "5px";
        body.style.marginBottom = "5px";
        body.style.pageBreakBefore = "avoid";
        body.style.fontSize = "14px";
        body.style.lineHeight = "1.4";
      });

      // Compact signature section
      const signatures = tempDiv.querySelectorAll(".signature");
      signatures.forEach((sig) => {
        sig.style.marginTop = "15px";
        sig.style.pageBreakInside = "avoid";
        sig.style.fontSize = "14px";
      });

      // Reduce all paragraph margins
      const paragraphs = tempDiv.querySelectorAll("p");
      paragraphs.forEach((p) => {
        p.style.marginTop = "3px";
        p.style.marginBottom = "3px";
        p.style.lineHeight = "1.4";
      });

      // Configure PDF options for maximum content on one page
      const options = {
        margin: [10, 10, 10, 10], // Very small margins: top, right, bottom, left (in mm)
        filename: `${
          originalDocumentData.document_type?.replace(/_/g, "_") || "document"
        }_${new Date().getTime()}.pdf`,
        image: { type: "jpeg", quality: 0.9 },
        html2canvas: {
          scale: 1.2, // Lower scale for more compact content
          useCORS: true,
          letterRendering: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          width: 794, // A4 width in pixels at 96 DPI
          height: 1123, // A4 height in pixels at 96 DPI
          scrollX: 0,
          scrollY: 0,
          dpi: 96,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true,
          precision: 2,
        },
        pagebreak: {
          mode: "avoid-all",
          avoid: "*", // Avoid page breaks on all elements
        },
      };

      // Generate and download PDF
      await html2pdf.default().from(tempDiv).set(options).save();

      console.log("[RecentDocsView] PDF download completed successfully");
    } catch (err) {
      console.error(
        "[RecentDocsView] Error generating PDF with html2pdf:",
        err
      );

      // Fallback to browser print method
      console.log("[RecentDocsView] Falling back to browser print method...");
      fallbackToPrintMethod();
    }
  };

  // Fallback method using browser print
  const fallbackToPrintMethod = () => {
    try {
      // Create a temporary iframe for printing
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.top = "-1000px";
      iframe.style.left = "-1000px";
      iframe.style.width = "1px";
      iframe.style.height = "1px";
      iframe.style.opacity = "0";

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Document - ZoomDocs</title>
                    <style>
                        @page { 
                            size: A4; 
                            margin: 15mm; 
                        }
                        body { 
                            font-family: "Times New Roman", serif; 
                            margin: 0; 
                            padding: 0; 
                            line-height: 1.6; 
                            font-size: 14px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 15px;
                            page-break-after: avoid;
                            page-break-inside: avoid;
                        }
                        .header img {
                            max-width: 150px;
                            height: auto;
                            margin: 5px auto;
                        }
                        .date {
                            margin-bottom: 15px;
                        }
                        .signature {
                            margin-top: 20px;
                            page-break-inside: avoid;
                        }
                        .footer {
                            page-break-inside: avoid;
                        }
                        .container {
                            padding: 10px;
                            margin: 0;
                        }
                        .download-container, 
                        button { 
                            display: none !important; 
                        }
                        p {
                            margin: 8px 0;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            page-break-after: avoid;
                            margin: 10px 0 8px 0;
                        }
                    </style>
                </head>
                <body>${htmlContent}</body>
                </html>
            `);
      iframeDoc.close();

      // Wait for content to load then print
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();

          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      };
    } catch (error) {
      console.error("[RecentDocsView] Fallback print method failed:", error);

      // Final fallback to server PDF if available
      if (originalDocumentData && originalDocumentData.file_path_pdf) {
        console.log("[RecentDocsView] Using server PDF as final fallback...");
        downloadServerPDF();
      }
    }
  };

  // Fallback function for server PDF download
  const downloadServerPDF = async () => {
    const { authId, userId } = getAuthFromStorage();

    if (!authId || !userId) {
      console.error("[RecentDocsView] Authentication credentials not found");
      return;
    }

    try {
      const fullFilePath = originalDocumentData.file_path_pdf;
      const pdfFileName = fullFilePath.split("/").pop();

      const response = await getGeneratedDocument(
        "pdf",
        pdfFileName,
        authId,
        userId
      );

      if (response.status === 200 && response.data instanceof Blob) {
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = pdfFileName;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      }
    } catch (err) {
      console.error("[RecentDocsView] Error downloading server PDF:", err);
    }
  };

  return (
    <div
      className={`dashboard-layout ${
        sidebarCollapsed ? "sidebar-collapsed" : ""
      } ${isDarkMode ? "" : "light-mode"}`}
    >
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
                  className={`fas fa-moon theme-icon ${
                    isDarkMode ? "active" : ""
                  }`}
                ></i>
                <i
                  className={`fas fa-sun theme-icon ${
                    !isDarkMode ? "active" : ""
                  }`}
                ></i>
              </div>
            </div>

            {/* <div className="login-avatar" onClick={handleAvatarClick}>
              <div className="avatar-container">
                <div className="avatar-icon">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div className="avatar-text">
                  <span className="login-text">Login</span>
                </div>
              </div>
              <div className="avatar-glow"></div>
            </div> */}
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
                      {originalDocumentData.document_type
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h2>
                    <div className="document-meta">
                      <span className="document-type">
                        <i className="fa-solid fa-tag"></i>
                        {originalDocumentData.document_type
                          ?.replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span className="document-date">
                        <i className="fa-solid fa-calendar"></i>
                        {new Date(
                          originalDocumentData.generated_at
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="document-actions">
                  <button
                    className="action-btn download-btn"
                    onClick={handleDownloadPDF}
                    title="Download as PDF"
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>Download PDF</span>
                  </button>
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
                          marginTop: "1rem",
                          padding: "0.5rem 1rem",
                          background: "var(--primary-color)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
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
              <p>
                No document data was provided. Please select a document from the
                sidebar.
              </p>
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
