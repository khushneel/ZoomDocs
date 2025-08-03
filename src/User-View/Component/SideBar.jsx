import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import creditsIcon from "../../assets/Icons/Vector (1).png";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppSelector } from "../../store/hooks";
import "./SideBar.css";

export default function SideBarCom({ isCollapsed, onToggle }) {
	const navigate = useNavigate();
	const toggleRef = useRef(null);
	const sidebarRef = useRef(null);
	const { credits } = useAppSelector((state) => state.user);
	const { isDarkMode } = useTheme();
	const [isCreditsLoading, setIsCreditsLoading] = useState(true);
	const [isAnimating, setIsAnimating] = useState(false);
	const [hoveredItem, setHoveredItem] = useState(null);

	// Enhanced recent documents with better text handling
	const recentDocuments = [
		{
			id: 1,
			title: "Rental agreement march 2025",
			date: "2 days ago",
		},
		{
			id: 2,
			title: "Legal notice for tax April - May",
			date: "1 week ago",
		},
		{
			id: 3,
			title: "Rental agreement december 2024",
			date: "2 weeks ago",
		},
	];

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

	const handleGenerateClick = useCallback(() => {
		navigate("/generate");
	}, [navigate]);

	const handleRecentItemClick = useCallback(
		(documentId) => {
			navigate(`/document/${documentId}`);
		},
		[navigate]
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
						onClick={handleGenerateClick}
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
						{recentDocuments.map((doc, index) => (
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
										{doc.title}
									</div>
									<div className="recent-date">
										{doc.date}
									</div>
								</div>
							</div>
						))}
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
