import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentTemplateByType } from "../../User-View-Api";
import SideBarCom from "../../Component/SideBar";
import { useTheme } from "../../../contexts/ThemeContext";
import toast from 'react-hot-toast';
import "./DocsForm.css";

export default function DocsForm() {
    const { docstype } = useParams();
    const navigate = useNavigate();
    const { isDarkMode, sidebarCollapsed, toggleTheme, toggleSidebar } = useTheme();
    const [templateData, setTemplateData] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [step, setStep] = useState(1);
    const [steps, setSteps] = useState([]);
    const [stepTitles, setStepTitles] = useState([]);
    const [currentStepFields, setCurrentStepFields] = useState([]);

    // Only use the first param (Refund-request-letter)
    const formattedDocstype = decodeURIComponent(docstype).replace(/-| /g, "_");

    useEffect(() => {
        console.log('Fetching document template for:', formattedDocstype);
        getDocumentTemplateByType(formattedDocstype)
            .then(res => {
                console.log('Document template API response:', res.data);
                setTemplateData(res.data);
                
                if (res.data && res.data.schema) {
                    // Initialize form values
                    const initial = {};
                    res.data.schema.forEach(field => {
                        initial[field.key] = field.key === 'current_date' ? new Date().toLocaleDateString() : "";
                    });
                    setFormValues(initial);
                    console.log('Initialized form values:', initial);
                    
                    // Group fields by step
                    const stepGroups = {};
                    const stepTitleMap = {
                        1: "Personal Information",
                        2: "Order Details", 
                        3: "Refund Request",
                        4: "Letter Preferences"
                    };
                    
                    res.data.schema.forEach(field => {
                        const stepNum = field.step || 1;
                        if (!stepGroups[stepNum]) {
                            stepGroups[stepNum] = [];
                        }
                        stepGroups[stepNum].push(field);
                    });
                    
                    // Convert to arrays and sort
                    const stepsArray = Object.keys(stepGroups)
                        .sort((a, b) => parseInt(a) - parseInt(b))
                        .map(stepNum => ({
                            stepNumber: parseInt(stepNum),
                            title: stepTitleMap[stepNum] || `Step ${stepNum}`,
                            fields: stepGroups[stepNum].sort((a, b) => {
                                // Sort required fields first
                                if (a.required && !b.required) return -1;
                                if (!a.required && b.required) return 1;
                                return 0;
                            })
                        }));
                    
                    setSteps(stepsArray);
                    setStepTitles(stepsArray.map(s => s.title));
                    setCurrentStepFields(stepsArray[0]?.fields || []);
                    
                    console.log('Form steps created:', stepsArray);
                }
            })
            .catch(err => {
                console.error('Document template API error:', err);
                toast.error("Failed to fetch template: " + err.message);
            });
    }, [formattedDocstype]);

    // Update current step fields when step changes
    useEffect(() => {
        if (steps.length > 0) {
            const currentStep = steps.find(s => s.stepNumber === step);
            setCurrentStepFields(currentStep?.fields || []);
        }
    }, [step, steps]);

    const handleChange = (key, value) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
    };

    const validateCurrentStep = () => {
        const currentStepData = steps.find(s => s.stepNumber === step);
        if (!currentStepData) return true;
        
        for (const field of currentStepData.fields) {
            if (field.required && !formValues[field.key]?.trim()) {
                toast.error(`Please fill out the required field: ${field.description}`);
                return false;
            }
        }
        return true;
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (!validateCurrentStep()) return;
        
        const nextStep = step + 1;
        if (nextStep <= steps.length) {
            setStep(nextStep);
        }
    };

    const handleBack = (e) => {
        e.preventDefault();
        const prevStep = step - 1;
        if (prevStep >= 1) {
            setStep(prevStep);
        }
    };

    const handleProceed = (e) => {
        e.preventDefault();
        
        // Validate all required fields across all steps
        for (const stepData of steps) {
            for (const field of stepData.fields) {
                if (field.required && !formValues[field.key]?.trim()) {
                    toast.error(`Please fill out the required field: ${field.description}`);
                    // Navigate to the step with the missing field
                    setStep(stepData.stepNumber);
                    return;
                }
            }
        }
        
        console.log('Final form values:', formValues);
        // Pass user_inputs to GenerateDocs page using state
        navigate(`/${docstype}/Template/generate`, { state: { user_inputs: formValues } });
    };

    const handleAvatarClick = () => {
        navigate("/SignUp");
    };

    // Progress bar percent based on current step
    const progress = steps.length > 0 ? (step / steps.length) * 100 : 0;

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
                <div className="docsform-header">
                    <div className="docsform-title text-primary">
                        {templateData?.documentType?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Document Form"}
                    </div>
                    <div className="docsform-subtitle text-secondary">
                        Fill out the information below to generate your professional document
                    </div>
                </div>

                {/* Enhanced Step Progress Indicator */}
                {steps.length > 1 && (
                    <div className="step-progress-container">
                        <div className="step-indicators">
                            {steps.map((stepData, index) => (
                                <div key={stepData.stepNumber} className="step-indicator-wrapper">
                                    <div 
                                        className={`step-indicator ${step > stepData.stepNumber ? 'completed' : ''} ${step === stepData.stepNumber ? 'active' : ''} ${step < stepData.stepNumber ? 'upcoming' : ''}`}
                                    >
                                        <div className="step-number">
                                            {step > stepData.stepNumber ? (
                                                <i className="fas fa-check"></i>
                                            ) : (
                                                stepData.stepNumber
                                            )}
                                        </div>
                                        <div className="step-label">{stepData.title}</div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`step-connector ${step > stepData.stepNumber ? 'completed' : ''}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="progress-bar-container">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="progress-text">
                                <span className="progress-step">Step {step} of {steps.length}</span>
                                <span className="progress-percent">{Math.round(progress)}%</span>
                            </div>
                        </div>
                    </div>
                )}


                <form className="docsform-form step-animate" onSubmit={step === steps.length ? handleProceed : handleNext}>
                    <div className="docsform-fields-container">
                        {currentStepFields.map((field, idx) => (
                            <div className="docsform-field" key={field.key} style={{ animationDelay: `${idx * 0.1}s` }}>
                                <label className="docsform-label text-primary">
                                    <span className="label-text">
                                        {field.description}
                                        {field.required && <span className="docsform-required">*</span>}
                                    </span>
                                    {field.neededForSignature && (
                                        <span className="signature-badge">
                                            <i className="fas fa-signature"></i>
                                            For Signature
                                        </span>
                                    )}
                                </label>
                                
                                {field.key === "tone_level" ? (
                                    <div className="tone-selector">
                                        {[0, 1, 2, 3].map(level => (
                                            <div 
                                                key={level}
                                                className={`tone-option ${formValues[field.key] == level ? 'selected' : ''}`}
                                                onClick={() => handleChange(field.key, level.toString())}
                                            >
                                                <div className="tone-level">Level {level}</div>
                                                <div className="tone-description">
                                                    {level === 0 && "Respectful & Objective"}
                                                    {level === 1 && "Assertive & Polite"}
                                                    {level === 2 && "Clear Dissatisfaction"}
                                                    {level === 3 && "Firm & Persistent"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : field.type === "integer" ? (
                                    <input
                                        type="number"
                                        className="docsform-input input-field"
                                        value={formValues[field.key] || ""}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                        required={field.required}
                                        placeholder={`Enter ${field.description.toLowerCase()}`}
                                    />
                                ) : field.description.length > 60 || field.key === "additional_notes" || field.key === "refund_reason" ? (
                                    <textarea
                                        className="docsform-textarea input-field"
                                        value={formValues[field.key] || ""}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                        required={field.required}
                                        placeholder={`Enter ${field.description.toLowerCase()}`}
                                        rows={field.key === "additional_notes" ? 4 : 3}
                                    />
                                ) : field.key === "current_date" ? (
                                    <input
                                        type="date"
                                        className="docsform-input input-field"
                                        value={formValues[field.key] || ""}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                        required={field.required}
                                    />
                                ) : (
                                    <input
                                        type={field.key.includes('email') ? 'email' : field.key.includes('phone') ? 'tel' : 'text'}
                                        className="docsform-input input-field"
                                        value={formValues[field.key] || ""}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                        required={field.required}
                                        placeholder={`Enter ${field.description.toLowerCase()}`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="docsform-stepper-btns">
                        {step > 1 && (
                            <button className="docsform-back-btn" onClick={handleBack} type="button">
                                <i className="fas fa-arrow-left"></i>
                                Back
                            </button>
                        )}
                        {step < steps.length && (
                            <button className="docsform-next-btn btn-primary" type="submit">
                                Next
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        )}
                        {step === steps.length && (
                            <button className="docsform-proceed-btn btn-primary" type="submit">
                                <i className="fas fa-magic"></i>
                                Generate Document
                            </button>
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