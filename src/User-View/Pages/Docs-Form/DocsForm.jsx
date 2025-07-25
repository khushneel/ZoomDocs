import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentTemplateByType } from "../../User-View-Api";
import SideBarCom from "../../Component/SideBar";
import { useTheme } from "../../../contexts/ThemeContext";
import "./DocsForm.css";

export default function DocsForm() {
    const { docstype } = useParams();
    const navigate = useNavigate();
    const { isDarkMode, sidebarCollapsed, toggleTheme, toggleSidebar } = useTheme();
    const [templateData, setTemplateData] = useState(null);
    const [error, setError] = useState("");
    const [formValues, setFormValues] = useState({});
    const [step, setStep] = useState(0);
    const [steps, setSteps] = useState([]);

    // Only use the first param (Refund-request-letter)
    const formattedDocstype = decodeURIComponent(docstype).replace(/-| /g, "_");

    useEffect(() => {
        getDocumentTemplateByType(formattedDocstype)
            .then(res => {
                setTemplateData(res.data);
                // Initialize form values
                if (res.data && res.data.schema) {
                    const initial = {};
                    res.data.schema.forEach(field => {
                        initial[field.key] = "";
                    });
                    setFormValues(initial);
                    // Split schema into steps of 6 fields each
                    const chunked = [];
                    for (let i = 0; i < res.data.schema.length; i += 6) {
                        chunked.push(res.data.schema.slice(i, i + 6));
                    }
                    setSteps(chunked);
                }
            })
            .catch(err => setError("Failed to fetch template: " + err.message));
    }, [formattedDocstype]);

    const handleChange = (key, value) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
    };

    const handleNext = (e) => {
        e.preventDefault();
        // Validate required fields in this step
        if (steps[step]) {
            for (const field of steps[step]) {
                if (field.required && !formValues[field.key]) {
                    setError(`Please fill out the required field: ${field.description}`);
                    return;
                }
            }
        }
        setError("");
        setStep(s => Math.min(s + 1, steps.length - 1));
    };

    const handleBack = (e) => {
        e.preventDefault();
        setError("");
        setStep(s => Math.max(s - 1, 0));
    };

    const handleProceed = (e) => {
        e.preventDefault();
        // Validate all required fields
        for (const chunk of steps) {
            for (const field of chunk) {
                if (field.required && !formValues[field.key]) {
                    setError(`Please fill out the required field: ${field.description}`);
                    return;
                }
            }
        }
        setError("");
        // Pass user_inputs to GenerateDocs page using state
        navigate(`/${docstype}/Template/generate`, { state: { user_inputs: formValues } });
    };

    const handleAvatarClick = () => {
        navigate("/SignUp");
    };

    // Progress bar percent
    const progress = steps.length > 0 ? ((step + 1) / steps.length) * 100 : 0;

    return (
        <div className={`dashboard-layout ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <SideBarCom isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            
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
            
            <div className="docsform-main">
                <div className="docsform-title text-primary">{templateData?.documentType?.replace(/_/g, " ") || "Document"}</div>
                <div className="docsform-subtitle text-secondary">This is how others will see your info on the site.</div>
                {/* Progress Bar */}
                {steps.length > 1 && (
                    <div className="docsform-progress-bar-outer">
                        <div className="docsform-progress-bar-inner" style={{ width: `${progress}%` }}></div>
                        <div className="docsform-progress-label text-secondary">Step {step + 1} of {steps.length}</div>
                    </div>
                )}
                <form className={`docsform-form step-animate card`} onSubmit={step === steps.length - 1 ? handleProceed : handleNext}>
                    <div className="docsform-fields-container">
                        {steps[step] && steps[step].map((field, idx) => (
                            <div className="docsform-field" key={field.key}>
                                <label className="docsform-label text-primary">
                                    {field.description}
                                    {field.required && <span className="docsform-required">*</span>}
                                </label>
                                {field.type === "integer" ? (
                                    <input
                                        type="number"
                                        className="docsform-input input-field"
                                        value={formValues[field.key]}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                        required={field.required}
                                    />
                                ) : field.description.length > 60 || field.key === "additional_notes" ? (
                                    <textarea
                                        className="docsform-textarea input-field"
                                        value={formValues[field.key]}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                        required={field.required}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        className="docsform-input input-field"
                                        value={formValues[field.key]}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    {error && <div className="docsform-error error-message">{error}</div>}
                    <div className="docsform-stepper-btns">
                        {step > 0 && (
                            <button className="docsform-back-btn" onClick={handleBack} type="button">Back</button>
                        )}
                        {step < steps.length - 1 && (
                            <button className="docsform-next-btn btn-primary" type="submit">Next</button>
                        )}
                        {step === steps.length - 1 && (
                            <button className="docsform-proceed-btn btn-primary" type="submit">Proceed</button>
                        )}
                    </div>
                </form>
            </div>
            
            <div className="login-avatar" onClick={handleAvatarClick} title="Sign In / Sign Up">
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