import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import SideBarCom from "../../Component/SideBar";
import { generateDocument, getGeneratedDocument } from "../../User-View-Api";
import {
  getCreditsAsync,
  getGeneratedDocumentsListAsync,
} from "../../../store/userSlice";
import "./GenerateDocs.css";

export default function GenerateDocs() {
  const location = useLocation();
  const { docstype } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode, sidebarCollapsed, toggleTheme, toggleSidebar } =
    useTheme();

  // Get auth data from Redux store
  const {
    zoomdocs_auth_id: reduxAuthId,
    zoomdocs_user_id: reduxUserId,
    isLoading,
  } = useSelector((state) => state.user);

  // Get auth data from localStorage as fallback
  const getAuthFromStorage = () => {
    const authId = reduxAuthId || localStorage.getItem("zoomdocs_auth_id");
    const userId = reduxUserId || localStorage.getItem("zoomdocs_user_id");
    return { authId, userId };
  };

  const [letter, setLetter] = useState("");
  const [apiData, setApiData] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingHtml, setIsLoadingHtml] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHtmlContent, setEditedHtmlContent] = useState("");
  const [error, setError] = useState(null);
  const [creditsAndDocsFetched, setCreditsAndDocsFetched] = useState(false);
  const [documentGenerationStarted, setDocumentGenerationStarted] =
    useState(false);
  const editorRef = useRef(null);

  // Function to fetch credits and documents list using Redux - STRICTLY SEQUENTIAL
  const fetchCreditsAndDocuments = async (authId, userId) => {
    // Prevent multiple calls
    if (creditsAndDocsFetched) {
      console.log(
        "[GenerateDocs] Credits and docs already fetched, skipping..."
      );
      return;
    }

    try {
      console.log("[GenerateDocs] Starting sequential API calls...");
      setCreditsAndDocsFetched(true);

      // Step 3: Hit getCreditsAsync and wait for response
      console.log("[GenerateDocs] Step 3: Calling getCreditsAsync...");
      const creditsResult = await dispatch(
        getCreditsAsync({
          zoomdocs_auth_id: authId,
          zoomdocs_user_id: userId,
        })
      );

      // Check if credits API was successful
      if (creditsResult.type.endsWith("/fulfilled")) {
        console.log(
          "[GenerateDocs] Step 3: getCreditsAsync successful, proceeding to Step 4"
        );

        // Step 4: Hit getGeneratedDocumentsListAsync and wait for response
        console.log(
          "[GenerateDocs] Step 4: Calling getGeneratedDocumentsListAsync..."
        );
        const documentsResult = await dispatch(
          getGeneratedDocumentsListAsync({
            zoomdocs_auth_id: authId,
            zoomdocs_user_id: userId,
            records: 3,
          })
        );

        // Check if documents API was successful
        if (documentsResult.type.endsWith("/fulfilled")) {
          console.log(
            "[GenerateDocs] Step 4: getGeneratedDocumentsListAsync successful"
          );
          console.log(
            "[GenerateDocs] 🚫 ALL API CALLS COMPLETED - NO MORE CALLS WILL BE MADE"
          );
          console.log(
            "[GenerateDocs] 🚫 DOCUMENT GENERATION FLOW FINISHED - STOPPING HERE"
          );
        } else {
          console.log(
            "[GenerateDocs] Step 4: getGeneratedDocumentsListAsync failed"
          );
        }
      } else {
        console.log(
          "[GenerateDocs] Step 3: getCreditsAsync failed, stopping sequence"
        );
      }
    } catch (error) {
      console.error("[GenerateDocs] Error in sequential API calls:", error);
      setCreditsAndDocsFetched(false); // Reset on error so it can retry
    }
  };

  useEffect(() => {
    // Prevent multiple executions of document generation
    if (documentGenerationStarted) {
      console.log(
        "[GenerateDocs] Document generation already started, skipping..."
      );
      return;
    }

    if (
      location.state &&
      location.state.user_inputs &&
      docstype &&
      !isLoading
    ) {
      console.log(
        "[GenerateDocs] ✅ STARTING DOCUMENT GENERATION - SINGLE EXECUTION ONLY"
      );
      setDocumentGenerationStarted(true); // Set flag immediately to prevent re-execution
      setIsGenerating(true);
      let { user_inputs } = location.state;
      let tone_level = 0;
      if (user_inputs.tone_level !== undefined) {
        tone_level = parseInt(user_inputs.tone_level, 10);
        const { tone_level: _, ...rest } = user_inputs;
        user_inputs = rest;
      }

      // Get auth credentials
      const { authId, userId } = getAuthFromStorage();

      console.log("[GenerateDocs] Starting API call with:", {
        docstype,
        tone_level,
        user_inputs,
        zoomdocs_auth_id: authId,
        zoomdocs_user_id: userId,
      });

      const callOptions = {
        tone_level,
        zoomdocs_auth_id: authId,
        zoomdocs_user_id: userId,
      };

      // Step 1: Generate Document
      console.log("[GenerateDocs] Step 1: Calling generateDocument API...");
      generateDocument(docstype, user_inputs, callOptions)
        .then((res) => {
          console.log("[GenerateDocs] Step 1: generateDocument response:", res);

          // Check if Step 1 was successful (status 200)
          if (res.status !== 200) {
            console.log(
              "[GenerateDocs] Step 1: generateDocument failed with status:",
              res.status
            );
            
            // Set appropriate error based on status code
            let errorData = {
              type: "general",
              title: "Generation Failed",
              message: "Unable to generate document",
              details: "Please try again or contact support if the issue persists.",
            };

            if (res.status === 403) {
              errorData = {
                type: "credit",
                title: "Insufficient Credits",
                message: "You don't have enough credits to generate this document",
                details: "Please top up your credits to continue generating documents.",
              };
            } else if (res.status === 401) {
              errorData = {
                type: "general",
                title: "Authentication Error",
                message: "Your session has expired",
                details: "Please log in again to continue.",
              };
            } else if (res.status === 429) {
              errorData = {
                type: "general",
                title: "Rate Limit Exceeded",
                message: "Too many requests",
                details: "Please wait a moment before trying again.",
              };
            } else if (res.status >= 500) {
              errorData = {
                type: "general",
                title: "Server Error",
                message: "Our servers are experiencing issues",
                details: "Please try again in a few minutes.",
              };
            }

            setError(errorData);
            setIsGenerating(false);
            return;
          }

          // Check if the response contains an error
          if (res.data && res.data.error) {
            console.log(
              "[GenerateDocs] Step 1: generateDocument returned error:",
              res.data.error
            );
            setError({
              type: res.data.error.toLowerCase().includes("credit")
                ? "credit"
                : "general",
              title: res.data.error.toLowerCase().includes("credit")
                ? "Insufficient Credits"
                : "Generation Error",
              message: res.data.error,
              details:
                res.data.message ||
                "Please try again or contact support if the issue persists.",
            });
            setIsGenerating(false);
            return;
          }

          console.log(
            "[GenerateDocs] Step 1: generateDocument successful, proceeding to Step 2"
          );
          setLetter(
            res.data.letter ||
              res.data.raw_content ||
              "Sample generated letter content goes here."
          );
          setApiData(res.data);
          setError(null); // Clear any previous errors
          setIsGenerating(false);

          // Step 2: Get Generated Document (HTML) if available
          if (res.data && res.data.html && res.data.html.fileName) {
            setIsLoadingHtml(true);
            const htmlFileName = res.data.html.fileName;
            console.log(
              "[GenerateDocs] Step 2: Calling getGeneratedDocument API with fileName:",
              htmlFileName
            );

            getGeneratedDocument("html", htmlFileName, authId, userId)
              .then((htmlRes) => {
                console.log(
                  "[GenerateDocs] Step 2: getGeneratedDocument response status:",
                  htmlRes.status
                );

                // Check if Step 2 was successful (status 200)
                if (htmlRes.status !== 200) {
                  console.log(
                    "[GenerateDocs] Step 2: getGeneratedDocument failed with status:",
                    htmlRes.status
                  );
                  setIsLoadingHtml(false);
                  return;
                }

                console.log(
                  "[GenerateDocs] Step 2: getGeneratedDocument successful, proceeding to Step 3"
                );

                // If it's a blob, try to read it as text
                if (htmlRes.data instanceof Blob) {
                  htmlRes.data
                    .text()
                    .then((text) => {
                      console.log(
                        "[GenerateDocs] Step 2: HTML content loaded successfully"
                      );
                      setHtmlContent(text);
                      setIsLoadingHtml(false);

                      // Step 3 & 4: After successful HTML loading, call credits and documents APIs
                      fetchCreditsAndDocuments(authId, userId);
                    })
                    .catch((err) => {
                      console.error(
                        "[GenerateDocs] Step 2: Error reading HTML blob:",
                        err
                      );
                      setIsLoadingHtml(false);
                    });
                }
              })
              .catch((htmlErr) => {
                console.error(
                  "[GenerateDocs] Step 2: getGeneratedDocument error:",
                  htmlErr
                );
                setIsLoadingHtml(false);
              });
          } else {
            console.log(
              "[GenerateDocs] Step 2: No HTML file available, skipping to Step 3"
            );
            // Step 3 & 4: If no HTML file, proceed directly to credits and documents APIs
            fetchCreditsAndDocuments(authId, userId);
          }
        })
        .catch((err) => {
          console.error("[GenerateDocs] API error:", err);

          // Handle different types of errors
          let errorData = {
            type: "general",
            title: "Generation Failed",
            message: "Unable to generate document",
            details: "Please check your connection and try again.",
          };

          if (err.response && err.response.data) {
            const responseData = err.response.data;
            if (responseData.error) {
              errorData = {
                type: responseData.error.toLowerCase().includes("credit")
                  ? "credit"
                  : "general",
                title: responseData.error.toLowerCase().includes("credit")
                  ? "Insufficient Credits"
                  : "Generation Error",
                message: responseData.error,
                details:
                  responseData.message ||
                  "Please try again or contact support if the issue persists.",
              };
            }
          } else if (err.message) {
            errorData.details = err.message;
          }

          setError(errorData);
          setIsGenerating(false);
        });
    } else {
      console.log("[GenerateDocs] Missing required data for generation:", {
        hasLocationState: !!location.state,
        hasUserInputs: !!location.state?.user_inputs,
        docstype,
        isLoading,
      });
    }
  }, [
    location.state,
    docstype,
    reduxAuthId,
    reduxUserId,
    isLoading,
    documentGenerationStarted,
  ]);

  const handleDownloadPDF = () => {
    if (apiData && apiData.pdf && apiData.pdf.fileName) {
      const fileName = apiData.pdf.fileName;
      const { authId, userId } = getAuthFromStorage();
      getGeneratedDocument("pdf", fileName, authId, userId)
        .then((res) => {
          console.log("[Download PDF] Blob response:", res);
          if (res.status === 200 && res.data instanceof Blob) {
            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }, 100);
          } else {
            console.error("[Download PDF] No valid PDF blob in response");
          }
        })
        .catch((err) => {
          console.error("[Download PDF] Error:", err);
        });
    } else {
      console.log("PDF fileName not available");
    }
  };

  const handleRetry = () => {
    console.log(
      "[GenerateDocs] ✅ RETRY: Resetting all flags and starting fresh"
    );
    setError(null);
    setLetter("");
    setApiData(null);
    setHtmlContent("");
    setCreditsAndDocsFetched(false); // Reset to allow fetching again
    setDocumentGenerationStarted(false); // Reset to allow generation again

    // Trigger the useEffect to retry generation
    if (location.state && location.state.user_inputs && docstype) {
      setIsGenerating(true);
      let { user_inputs } = location.state;
      let tone_level = 0;
      if (user_inputs.tone_level !== undefined) {
        tone_level = parseInt(user_inputs.tone_level, 10);
        const { tone_level: _, ...rest } = user_inputs;
        user_inputs = rest;
      }

      const { authId, userId } = getAuthFromStorage();

      const callOptions = {
        tone_level,
        zoomdocs_auth_id: authId,
        zoomdocs_user_id: userId,
      };

      // Step 1 (Retry): Generate Document
      console.log(
        "[GenerateDocs-Retry] Step 1: Calling generateDocument API..."
      );
      generateDocument(docstype, user_inputs, callOptions)
        .then((res) => {
          console.log(
            "[GenerateDocs-Retry] Step 1: generateDocument response:",
            res
          );

          // Check if Step 1 was successful (status 200)
          if (res.status !== 200) {
            console.log(
              "[GenerateDocs-Retry] Step 1: generateDocument failed with status:",
              res.status
            );
            
            // Set appropriate error based on status code
            let errorData = {
              type: "general",
              title: "Generation Failed",
              message: "Unable to generate document",
              details: "Please try again or contact support if the issue persists.",
            };

            if (res.status === 403) {
              errorData = {
                type: "credit",
                title: "Insufficient Credits",
                message: "You don't have enough credits to generate this document",
                details: "Please top up your credits to continue generating documents.",
              };
            } else if (res.status === 401) {
              errorData = {
                type: "general",
                title: "Authentication Error",
                message: "Your session has expired",
                details: "Please log in again to continue.",
              };
            } else if (res.status === 429) {
              errorData = {
                type: "general",
                title: "Rate Limit Exceeded",
                message: "Too many requests",
                details: "Please wait a moment before trying again.",
              };
            } else if (res.status >= 500) {
              errorData = {
                type: "general",
                title: "Server Error",
                message: "Our servers are experiencing issues",
                details: "Please try again in a few minutes.",
              };
            }

            setError(errorData);
            setIsGenerating(false);
            return;
          }

          if (res.data && res.data.error) {
            console.log(
              "[GenerateDocs-Retry] Step 1: generateDocument returned error:",
              res.data.error
            );
            setError({
              type: res.data.error.toLowerCase().includes("credit")
                ? "credit"
                : "general",
              title: res.data.error.toLowerCase().includes("credit")
                ? "Insufficient Credits"
                : "Generation Error",
              message: res.data.error,
              details:
                res.data.message ||
                "Please try again or contact support if the issue persists.",
            });
            setIsGenerating(false);
            return;
          }

          console.log(
            "[GenerateDocs-Retry] Step 1: generateDocument successful, proceeding to Step 2"
          );
          setLetter(
            res.data.letter ||
              res.data.raw_content ||
              "Sample generated letter content goes here."
          );
          setApiData(res.data);
          setError(null);
          setIsGenerating(false);

          // Step 2 (Retry): Get Generated Document (HTML) if available
          if (res.data && res.data.html && res.data.html.fileName) {
            setIsLoadingHtml(true);
            const htmlFileName = res.data.html.fileName;
            console.log(
              "[GenerateDocs-Retry] Step 2: Calling getGeneratedDocument API with fileName:",
              htmlFileName
            );

            getGeneratedDocument("html", htmlFileName, authId, userId)
              .then((htmlRes) => {
                console.log(
                  "[GenerateDocs-Retry] Step 2: getGeneratedDocument response status:",
                  htmlRes.status
                );

                // Check if Step 2 was successful (status 200)
                if (htmlRes.status !== 200) {
                  console.log(
                    "[GenerateDocs-Retry] Step 2: getGeneratedDocument failed with status:",
                    htmlRes.status
                  );
                  setIsLoadingHtml(false);
                  return;
                }

                console.log(
                  "[GenerateDocs-Retry] Step 2: getGeneratedDocument successful, proceeding to Step 3"
                );

                if (htmlRes.data instanceof Blob) {
                  htmlRes.data
                    .text()
                    .then((text) => {
                      console.log(
                        "[GenerateDocs-Retry] Step 2: HTML content loaded successfully"
                      );
                      setHtmlContent(text);
                      setIsLoadingHtml(false);

                      // Step 3 & 4 (Retry): After successful HTML loading, call credits and documents APIs
                      fetchCreditsAndDocuments(authId, userId);
                    })
                    .catch((err) => {
                      console.error(
                        "[GenerateDocs-Retry] Step 2: Error reading HTML blob:",
                        err
                      );
                      setIsLoadingHtml(false);
                    });
                }
              })
              .catch((htmlErr) => {
                console.error(
                  "[GenerateDocs-Retry] Step 2: getGeneratedDocument error:",
                  htmlErr
                );
                setIsLoadingHtml(false);
              });
          } else {
            console.log(
              "[GenerateDocs-Retry] Step 2: No HTML file available, skipping to Step 3"
            );
            // Step 3 & 4 (Retry): If no HTML file, proceed directly to credits and documents APIs
            fetchCreditsAndDocuments(authId, userId);
          }
        })
        .catch((err) => {
          console.error("[GenerateDocs-Retry] API error:", err);

          let errorData = {
            type: "general",
            title: "Generation Failed",
            message: "Unable to generate document",
            details: "Please check your connection and try again.",
          };

          if (err.response && err.response.data) {
            const responseData = err.response.data;
            if (responseData.error) {
              errorData = {
                type: responseData.error.toLowerCase().includes("credit")
                  ? "credit"
                  : "general",
                title: responseData.error.toLowerCase().includes("credit")
                  ? "Insufficient Credits"
                  : "Generation Error",
                message: responseData.error,
                details:
                  responseData.message ||
                  "Please try again or contact support if the issue persists.",
              };
            }
          }

          setError(errorData);
          setIsGenerating(false);
        });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTopUp = () => {
    // Navigate to billing/credits page or open payment modal
    // You can implement this based on your app structure
    try {
      // Try to navigate to a billing page if it exists in your app
      navigate("/billing");
    } catch (error) {
      // Fallback: open in new tab or show message
      const billingUrl = window.location.origin + "/billing";
      window.open(billingUrl, "_blank");
    }
  };

  const handleAvatarClick = () => {
    navigate("/SignUp");
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedHtmlContent(htmlContent);
    }
    setIsEditing(!isEditing);
  };

  const handleStartEdit = () => {
    setEditedHtmlContent(htmlContent);
    setIsEditing(true);
  };

  // Handle content changes without losing cursor position
  const handleContentInput = (e) => {
    setEditedHtmlContent(e.target.innerHTML);
  };

  // Set initial content when entering edit mode
  useEffect(() => {
    if (isEditing && editorRef.current && editedHtmlContent) {
      // Only set innerHTML if it's different to avoid cursor jumping
      if (editorRef.current.innerHTML !== editedHtmlContent) {
        editorRef.current.innerHTML = editedHtmlContent;
      }
    }
  }, [isEditing]);

  // Save cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  // Restore cursor position
  const restoreCursorPosition = (range) => {
    if (range) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleSaveEdits = () => {
    console.log("=== EDITED CONTENT ===");
    console.log("HTML Content:");
    console.log(editedHtmlContent);

    // Extract CSS from the HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = editedHtmlContent;
    const styleElements = tempDiv.querySelectorAll("style");
    const linkElements = tempDiv.querySelectorAll('link[rel="stylesheet"]');

    console.log("CSS Content:");
    styleElements.forEach((style, index) => {
      console.log(`Style Block ${index + 1}:`, style.textContent);
    });

    linkElements.forEach((link, index) => {
      console.log(`CSS Link ${index + 1}:`, link.href);
    });

    // Update the main HTML content with edited version
    setHtmlContent(editedHtmlContent);
    // Stay in editing mode - user can continue editing or switch to preview

    alert("Content saved! Check console for HTML and CSS logs.");
  };

  const handleContentChange = (e) => {
    // Just update the content without interfering with cursor
    setEditedHtmlContent(e.target.innerHTML);
  };

  return (
    <div
      className={`dashboard-layout ${isDarkMode ? "dark-mode" : "light-mode"}`}
    >
      <SideBarCom isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="generatedocs-main">
        <div className="generatedocs-center">
          <div className="generatedocs-preview-card ">
            {error ? (
              <div className="error-state">
                <div className="error-icon-container">
                  <i
                    className={`fas ${
                      error.type === "credit"
                        ? "fa-credit-card"
                        : "fa-exclamation-triangle"
                    } error-icon ${
                      error.type === "credit" ? "credit-icon" : ""
                    }`}
                  ></i>
                </div>
                <div className="error-content">
                  <h3
                    className={`error-title ${
                      error.type === "credit" ? "credit-title" : ""
                    }`}
                  >
                    {error.title}
                  </h3>
                  <p className="error-message">{error.message}</p>
                  <p className="error-details">{error.details}</p>
                </div>
                <div className="error-actions">
                  {error.type === "credit" ? (
                    <>
                      <button 
                        className="error-btn error-btn-primary"
                      >
                        <i
                          className="fas fa-plus"
                          style={{ marginRight: "0.5rem" }}
                        ></i>
                        Top Up Credits
                      </button>
                      <button
                        className="error-btn error-btn-secondary"
                        onClick={handleGoBack}
                      >
                        <i
                          className="fas fa-arrow-left"
                          style={{ marginRight: "0.5rem" }}
                        ></i>
                        Go Back
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="error-btn error-btn-primary"
                        onClick={handleRetry}
                      >
                        <i
                          className="fas fa-redo"
                          style={{ marginRight: "0.5rem" }}
                        ></i>
                        Try Again
                      </button>
                      <button
                        className="error-btn error-btn-secondary"
                        onClick={handleGoBack}
                      >
                        <i
                          className="fas fa-arrow-left"
                          style={{ marginRight: "0.5rem" }}
                        ></i>
                        Go Back
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : isGenerating && !error ? (
              <div className="loading-preview">
                <div className="loading-spinner"></div>
                <div className="loading-text generating-text">
                  Generating Document...
                </div>
                <div className="loading-subtext">
                  Please wait while we create your professional document
                </div>
              </div>
            ) : isLoadingHtml && !error ? (
              <div className="loading-preview">
                <div className="loading-spinner"></div>
                <div className="loading-text generating-text">
                  Preparing Preview...
                </div>
                <div className="loading-subtext">
                  Formatting your document for display
                </div>
              </div>
            ) : htmlContent ? (
              <div className="html-preview">
                {isEditing ? (
                  <div
                    ref={editorRef}
                    className="html-editor"
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={handleContentChange}
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "break-word",
                      outline: "none",
                    }}
                  />
                ) : (
                  <iframe
                    srcDoc={htmlContent}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      borderRadius: "12px",
                    }}
                    title="Document Preview"
                  />
                )}
              </div>
            ) : letter ? (
              <div className="letter-preview text-primary">
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                  }}
                >
                  {letter}
                </pre>
              </div>
            ) : (
              <div className="loading-preview">
                <div className="loading-text">Ready to Generate</div>
                <div className="loading-subtext">
                  Your document will appear here
                </div>
              </div>
            )}
          </div>
          {!error && (
            <div className="generatedocs-btn-row">
              <button
                className="generatedocs-btn btn-primary"
                onClick={handleDownloadPDF}
                disabled={!apiData || isGenerating || isLoadingHtml}
              >
                <i
                  className="fas fa-download"
                  style={{ marginRight: "8px" }}
                ></i>
                Download as PDF
              </button>

              {isEditing ? (
                <>
                  <button
                    className="generatedocs-btn btn-primary"
                    onClick={handleSaveEdits}
                    title="Save Changes and Log to Console"
                    style={{
                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    }}
                  >
                    <i
                      className="fas fa-save"
                      style={{ marginRight: "8px" }}
                    ></i>
                    Save
                  </button>
                  <button
                    className="generatedocs-btn btn-primary"
                    onClick={handleEditToggle}
                    title="Switch to Preview Mode"
                  >
                    <i
                      className="fas fa-eye"
                      style={{ marginRight: "8px" }}
                    ></i>
                    Preview
                  </button>
                </>
              ) : (
                <button
                  className="generatedocs-btn btn-primary"
                  onClick={handleStartEdit}
                  disabled={
                    !apiData || isGenerating || isLoadingHtml || !htmlContent
                  }
                >
                  <i className="fas fa-edit" style={{ marginRight: "8px" }}></i>
                  Edit Document
                </button>
              )}
            </div>
          )}
        </div>
      </div>

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
