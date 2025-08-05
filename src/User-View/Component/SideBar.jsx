import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import creditsIcon from "../../assets/Icons/Vector (1).png";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import "./SideBar.css";

export default function SideBarCom({ isCollapsed, onToggle }) {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const toggleRef = useRef(null);
	const sidebarRef = useRef(null);
	const { 
		credits, 
		zoomdocs_auth_id, 
		zoomdocs_user_id, 
		generatedDocuments,
		loadingStates 
	} = useAppSelector((state) => state.user);
	const { isDarkMode } = useTheme();
	const [isCreditsLoading, setIsCreditsLoading] = useState(true);
	const [isAnimating, setIsAnimating] = useState(false);
	const [hoveredItem, setHoveredItem] = useState(null);

	// Helper function to format document title from file_name
	const formatDocumentTitle = (fileName, documentType) => {
		if (!fileName) return 'Untitled Document';
		
		// Extract meaningful parts from file name
		const parts = fileName.split('_');
		const docType = documentType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Document';
		const date = parts[parts.length - 1]; // Get the date part
		return `${docType} ${date}`;
	};

	// Helper function to format relative date
	const formatRelativeDate = (dateString) => {
		if (!dateString) return '';
		
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return '';
		
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "1 day ago";
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 14) return "1 week ago";
		if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
		return `${Math.ceil(diffDays / 30)} months ago`;
	};

	// Process generated documents for display
	const recentDocuments = generatedDocuments?.documents?.documents ? 
		generatedDocuments.documents.documents
			.filter(doc => doc && doc.id) // Filter out invalid documents
			.map(doc => {
				return {
					id: doc.id,
					title: formatDocumentTitle(doc.file_name, doc.document_type),
					date: formatRelativeDate(doc.generated_at),
					fileName: doc.file_name,
					documentType: doc.document_type,
					filePath: doc.file_path_html,
					// Store the complete original document data
					originalDocumentData: doc
				};
			}) : [];

	useEffect(() => {
		const timer = setTimeout(
			() => {
				if (credits?.credits !== undefined) {
					setIsCreditsLoading(false);
				}
			},
			credits?.credits !== undefined ? 0 : 1200
		);

		return () => clearTimeout(timer);
	}, [credits]);

	// Enhanced toggle with smoother animation
	const handleToggleClick = useCallback(() => {
		if (isAnimating) return;

		setIsAnimating(true);

		if (toggleRef.current) {
			toggleRef.current.classList.add("clicked");

			// Remove old classes first for cleaner animation
			const icon = toggleRef.current.querySelector("i");
			if (icon) {
				icon.classList.remove("fa-chevron-left", "fa-chevron-right");

				// Add new class after a brief delay for smoother transition
				setTimeout(() => {
					icon.classList.add(
						isCollapsed ? "fa-chevron-left" : "fa-chevron-right"
					);
				}, 100);
			}

			setTimeout(() => {
				toggleRef.current?.classList.remove("clicked");
			}, 600);
		}

		onToggle();

		setTimeout(() => {
			setIsAnimating(false);
		}, 400);
	}, [isAnimating, isCollapsed, onToggle]);

	const handleLogoClick = useCallback(() => {
		navigate("/");
	}, [navigate]);



	const handleRecentItemClick = useCallback(
		(documentId) => {
			// Find the document data
			const clickedDocument = recentDocuments.find(doc => doc.id === documentId);
			
			// Only log the original document data
			if (clickedDocument && clickedDocument.originalDocumentData) {
				console.log('=== ORIGINAL DOCUMENT DATA FROM SIDEBAR ===');
				console.log('originalDocumentData:', clickedDocument.originalDocumentData);
				console.log('=== END ORIGINAL DOCUMENT DATA ===');
			}
			
			// Navigate to recent documents view with file path and pass originalDocumentData in state
			if (clickedDocument && clickedDocument.originalDocumentData) {
				// Extract file name from filePath for URL parameter
				const fileName = clickedDocument.fileName || 'document';
				navigate(`/View-Recent-Documents/${encodeURIComponent(fileName)}`, {
					state: { originalDocumentData: clickedDocument.originalDocumentData }
				});
			}
		},
		[navigate, recentDocuments]
	);

	const handleGetMoreCredits = useCallback(() => {
		navigate("/credits");
	}, [navigate]);

	const handleItemHover = useCallback((itemId, isHovering) => {
		setHoveredItem(isHovering ? itemId : null);
	}, []);

	return (
		<div
			ref={sidebarRef}
			className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
				isDarkMode ? "" : "light-mode"
			}`}
		>
			<div className="sidebar-glow"></div>

			<div className="sidebar-header">
				{!isCollapsed ? (
					<img
						src="https://darbdtgqhhdgvgarjlxf.supabase.co/storage/v1/object/public/zoomdocs-ai-storage/assets/zoomdocs_black_white.png"
						alt="ZoomDocs AI Logo"
						className="sidebar-logo"
						onClick={handleLogoClick}
						style={{ cursor: "pointer" }}
						loading="lazy"
					/>
				) : (
					<div className="collapsed-logo-container">
						<img
							src="https://darbdtgqhhdgvgarjlxf.supabase.co/storage/v1/object/public/zoomdocs-ai-storage/assets/zoomdocs_black_white.png"
							alt="ZoomDocs AI Logo"
							className="collapsed-logo"
							onClick={handleLogoClick}
							style={{ cursor: "pointer" }}
							loading="lazy"
						/>
					</div>
				)}

				<button
					ref={toggleRef}
					className={`sidebar-toggle ${
						isAnimating ? "animating" : ""
					}`}
					onClick={handleToggleClick}
					title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					disabled={isAnimating}
					aria-label={
						isCollapsed ? "Expand sidebar" : "Collapse sidebar"
					}
				>
					<i
						className={`fa-solid ${
							isCollapsed ? "fa-chevron-right" : "fa-chevron-left"
						}`}
					></i>
				</button>
			</div>

			{!isCollapsed && (
				<div className="sidebar-content">
					<button
						className="generate-btn"
						onMouseEnter={() => handleItemHover("generate", true)}
						onMouseLeave={() => handleItemHover("generate", false)}
					>
						<div className="btn-glow"></div>
						<i
							className="fa-solid fa-plus"
							style={{ marginRight: "8px" }}
						></i>
						<span>Generate New Document</span>
					</button>

					<div className="recents">
						<div className="recents-title">
							<i
								className="fa-solid fa-clock"
								style={{ marginRight: "8px" }}
							></i>
							Recent Documents
						</div>
						{loadingStates?.fetchingDocuments ? (
							<div className="recent-item" style={{ opacity: 0.7 }}>
								<div className="recent-dot"></div>
								<div className="recent-content">
									<div className="recent-title">Loading...</div>
									<div className="recent-date">Please wait</div>
								</div>
							</div>
						) : recentDocuments && recentDocuments.length > 0 ? (
							recentDocuments.slice(0, 5).map((doc, index) => {// Log what's being rendered
								return (
									<div
										key={doc.id}
										className={`recent-item ${
											hoveredItem === `recent-${doc.id}`
												? "hovered"
												: ""
										}`}
										onClick={() => handleRecentItemClick(doc.id)}
										onMouseEnter={() =>
											handleItemHover(`recent-${doc.id}`, true)
										}
										onMouseLeave={() =>
											handleItemHover(`recent-${doc.id}`, false)
										}
										style={{
											animationDelay: `${index * 0.1}s`,
										}}
									>
										<div className="recent-dot"></div>
										<div className="recent-content">
											<div className="recent-title">
												{doc.fileName}
											</div>
											<div className="recent-date">
												{formatRelativeDate(doc.generated_at)}
											</div>
										</div>
									</div>
								);
							})
						) : (
							<div className="recent-item" style={{ opacity: 0.6 }}>
								<div className="recent-dot"></div>
								<div className="recent-content">
									<div className="recent-title">No documents yet</div>
									<div className="recent-date">Generate your first document</div>
								</div>
							</div>
						)}
					</div>

					<div
						className={`credits-card ${
							hoveredItem === "credits" ? "hovered" : ""
						}`}
						onMouseEnter={() => handleItemHover("credits", true)}
						onMouseLeave={() => handleItemHover("credits", false)}
					>
						<div className="credits-card-glow"></div>
						<div className="credits-header">
							<img
								src={creditsIcon}
								alt="Credits icon"
								className="credits-icon"
								loading="lazy"
							/>
							<div className="credits-info">
								<div className="credits-title">
									Credits remaining
								</div>
								<div className="credits-count">
									{isCreditsLoading ? (
										<div
											className="credits-spinner"
											aria-label="Loading credits"
										></div>
									) : (
										<span>
											{credits?.credits !== undefined
												? credits.credits
												: 0}
										</span>
									)}
								</div>
							</div>
						</div>
						<button
							className="get-more-btn"
							onClick={handleGetMoreCredits}
							disabled={isCreditsLoading}
						>
							<i
								className="fa-solid fa-arrow-up"
								style={{ marginRight: "6px" }}
							></i>
							Get more
						</button>
					</div>
				</div>
			)}

			{isCollapsed && (
				<div className="collapsed-content">
					<div className="vertical-text-container">
						<span
							className="zoom-text"
							onClick={handleLogoClick}
							style={{ cursor: "pointer" }}
							title="ZoomDocs AI"
						>
							ZoomDocsAI
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
