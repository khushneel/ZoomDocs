import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import SideBarCom from "../../Component/SideBar";
import { generateDocument, getGeneratedDocument } from "../../User-View-Api";
import "./GenerateDocs.css";

export default function GenerateDocs() {
	const location = useLocation();
	const { docstype } = useParams();
	const navigate = useNavigate();
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
	const editorRef = useRef(null);

	useEffect(() => {
		if (
			location.state &&
			location.state.user_inputs &&
			docstype &&
			!isLoading
		) {
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

			generateDocument(docstype, user_inputs, callOptions)
				.then((res) => {
					console.log("[GenerateDocs] Full API response:", res);
					console.log("[GenerateDocs] API response data:", res.data);
					setLetter(
						res.data.letter ||
							res.data.raw_content ||
							"Sample generated letter content goes here."
					);
					setApiData(res.data);
					setIsGenerating(false);

					// Automatically call HTML API after document generation
					if (res.data && res.data.html && res.data.html.fileName) {
						setIsLoadingHtml(true);
						const htmlFileName = res.data.html.fileName;
						console.log(
							"[GenerateDocs] Auto-calling HTML API with fileName:",
							htmlFileName
						);

						getGeneratedDocument(
							"html",
							htmlFileName,
							authId,
							userId
						)
							.then((htmlRes) => {
								console.log(
									"[GenerateDocs-HTML] Full API response:",
									htmlRes
								);
								console.log(
									"[GenerateDocs-HTML] Response status:",
									htmlRes.status
								);
								console.log(
									"[GenerateDocs-HTML] Response data type:",
									typeof htmlRes.data
								);
								console.log(
									"[GenerateDocs-HTML] Response data size:",
									htmlRes.data?.size
								);

								// If it's a blob, try to read it as text
								if (htmlRes.data instanceof Blob) {
									htmlRes.data
										.text()
										.then((text) => {
											console.log(
												"[GenerateDocs-HTML] Blob content as text:"
											);
											console.log(text);
											// Set the HTML content to state for rendering
											setHtmlContent(text);
											setIsLoadingHtml(false);
										})
										.catch((err) => {
											console.error(
												"[GenerateDocs-HTML] Error reading blob as text:",
												err
											);
											setIsLoadingHtml(false);
										});
								}
							})
							.catch((htmlErr) => {
								console.error(
									"[GenerateDocs-HTML] Error:",
									htmlErr
								);
								console.error(
									"[GenerateDocs-HTML] Error response:",
									htmlErr.response?.data
								);
								setIsLoadingHtml(false);
							});
					}
				})
				.catch((err) => {
					console.error("[GenerateDocs] API error:", err);
					setLetter("Failed to generate letter.");
					setIsGenerating(false);
				});
		}
	}, [location.state, docstype, reduxAuthId, reduxUserId, isLoading]);

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
						console.error(
							"[Download PDF] No valid PDF blob in response"
						);
					}
				})
				.catch((err) => {
					console.error("[Download PDF] Error:", err);
				});
		} else {
			console.log("PDF fileName not available");
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
			className={`dashboard-layout ${
				isDarkMode ? "dark-mode" : "light-mode"
			}`}
		>
			<SideBarCom
				isCollapsed={sidebarCollapsed}
				onToggle={toggleSidebar}
			/>

			<div className="generatedocs-main">
				<div className="generatedocs-center">
					<div className="generatedocs-preview-card card">
						{isGenerating ? (
							<div className="loading-preview">
								<div className="loading-spinner"></div>
								<div className="loading-text generating-text">
									Generating Document...
								</div>
								<div className="loading-subtext">
									Please wait while we create your
									professional document
								</div>
							</div>
						) : isLoadingHtml ? (
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
								<div className="loading-text">
									Ready to Generate
								</div>
								<div className="loading-subtext">
									Your document will appear here
								</div>
							</div>
						)}
					</div>
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
										background:
											"linear-gradient(135deg, #22c55e, #16a34a)",
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
									!apiData ||
									isGenerating ||
									isLoadingHtml ||
									!htmlContent
								}
							>
								<i
									className="fas fa-edit"
									style={{ marginRight: "8px" }}
								></i>
								Edit Document
							</button>
						)}
					</div>
				</div>
			</div>

			<div
				className="theme-toggle"
				onClick={toggleTheme}
				title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
			>
				<div className="theme-toggle-slider">
					<i
						className={`fas ${isDarkMode ? "fa-moon" : "fa-sun"}`}
					></i>
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
