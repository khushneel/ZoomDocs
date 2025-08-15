import axios from "axios";

const BASE_URL = "https://1898f40a95f8.ngrok-free.app/api/v1";
const API_KEY = "asdiwfnlqndo139jnscakncsacd";

// Create axios instance with enhanced configuration
const api = axios.create({
	baseURL: BASE_URL,
	headers: {
		"X-API-KEY": API_KEY,
		"Content-Type": "application/json",
	},
	timeout: 30000, // 30 second timeout
	validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// Request interceptor for logging and error handling
api.interceptors.request.use(
	(config) => {
		console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
		return config;
	},
	(error) => {
		console.error("[API] Request error:", error);
		return Promise.reject(error);
	}
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
	(response) => {
		console.log(`[API] Response ${response.status}:`, response.config.url);
		return response;
	},
	(error) => {
		const errorMessage =
			error.response?.data?.message || error.message || "Network error";
		console.error("[API] Response error:", {
			url: error.config?.url,
			status: error.response?.status,
			message: errorMessage,
		});
		return Promise.reject(error);
	}
);

// Document-related API functions
export const documentAPI = {
	getTypes: () => api.get("/documents/types"),

	getTemplateByType: (type) => {
		if (!type) throw new Error("Document type is required");
		return api.get(`/documents/types/${encodeURIComponent(type)}`);
	},

	generate: (docstype, user_inputs, options = {}) => {
		if (!docstype) throw new Error("Document type is required");
		if (!user_inputs) throw new Error("User inputs are required");

		const {
			tone_level = 0,
			zoomdocs_auth_id = null,
			zoomdocs_user_id = null,
			user_file_name = null,
		} = options;

		const payload = {
			tone_level,
			user_inputs,
			zoomdocs_auth_id,
			zoomdocs_user_id,
			user_file_name,
		};

		// Add this line to debug
		console.log("Payload being sent to server:", payload);

		return api.post(
			`/documents/types/${encodeURIComponent(docstype)}/generate`,
			payload
		);
	},

	getGenerated: (type, fileName) => {
		if (!type || !fileName)
			throw new Error("Type and fileName are required");
		return api.get(
			`/documents/generated/${encodeURIComponent(
				type
			)}/${encodeURIComponent(fileName)}`,
			{
				responseType: "blob",
			}
		);
	},
};

// Authentication-related API functions
export const authAPI = {
	generateUser: () => api.post("/auth/user/generate", {}),

	checkUser: (zoomdocs_auth_id, zoomdocs_user_id) => {
		if (!zoomdocs_auth_id || !zoomdocs_user_id) {
			throw new Error(
				"Both zoomdocs_auth_id and zoomdocs_user_id are required"
			);
		}
		return api.post("/auth/user/check", {
			zoomdocs_auth_id,
			zoomdocs_user_id,
		});
	},

	startUser: (zoomdocs_auth_id, zoomdocs_user_id) => {
		if (!zoomdocs_auth_id || !zoomdocs_user_id) {
			throw new Error(
				"Both zoomdocs_auth_id and zoomdocs_user_id are required"
			);
		}
		return api.post("/auth/user/start", {
			zoomdocs_auth_id,
			zoomdocs_user_id,
		});
	},

	// Legacy functions for backward compatibility
	generateUserId: () => api.post("/auth/user_id/generate"),

	checkUserId: (zoomdocs_user_id) => {
		if (!zoomdocs_user_id) throw new Error("zoomdocs_user_id is required");
		return api.post("/auth/user_id/check", { zoomdocs_user_id });
	},

	getGeneratedDocumentsList: (zoomdocs_auth_id, zoomdocs_user_id, records = 3) => {
		if (!zoomdocs_auth_id || !zoomdocs_user_id) {
			throw new Error(
				"Both zoomdocs_auth_id and zoomdocs_user_id are required"
			);
		}
		return api.post('/auth/generated_documents/list', {
			zoomdocs_auth_id,
			zoomdocs_user_id,
			records,
		});
	},

	helpMeDecide: (zoomdocs_auth_id, zoomdocs_user_id, help_me_decide_inputs) => {
		if (!zoomdocs_auth_id || !zoomdocs_user_id) {
			throw new Error(
				"Both zoomdocs_auth_id and zoomdocs_user_id are required"
			);
		}
		if (!help_me_decide_inputs || !help_me_decide_inputs.describe_the_situation || !help_me_decide_inputs.what_do_you_expect) {
			throw new Error(
				"help_me_decide_inputs with describe_the_situation and what_do_you_expect are required"
			);
		}
		return api.post('/help-me-decide', {
			zoomdocs_auth_id,
			zoomdocs_user_id,
			help_me_decide_inputs,
		});
	},
};

// Credits-related API functions
export const creditsAPI = {
	get: (zoomdocs_auth_id, zoomdocs_user_id) => {
		if (!zoomdocs_auth_id || !zoomdocs_user_id) {
			throw new Error(
				"Both zoomdocs_auth_id and zoomdocs_user_id are required"
			);
		}
		return api.post("/credits", {
			zoomdocs_auth_id,
			zoomdocs_user_id,
		});
	},
};

// Backward compatibility exports (maintain existing function names)
export const getDocumentTypes = documentAPI.getTypes;
export const getDocumentTemplateByType = documentAPI.getTemplateByType;
export const generateDocument = documentAPI.generate;
export const getGeneratedDocument = documentAPI.getGenerated;
export const generateUser = authAPI.generateUser;
export const checkUser = authAPI.checkUser;
export const startUser = authAPI.startUser;
export const generateUserId = authAPI.generateUserId;
export const checkUserId = authAPI.checkUserId;
export const getGeneratedDocumentsList = authAPI.getGeneratedDocumentsList;
export const helpMeDecide = authAPI.helpMeDecide;
export const getCredits = creditsAPI.get;

// Export the configured axios instance for advanced usage
export { api };
