import axios from 'axios';

const BASE_URL = 'https://aaf2d6d45ba3.ngrok-free.app/api/v1';
const API_KEY = 'asdiwfnlqndo139jnscakncsacd';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-API-KEY': API_KEY,
    'Content-Type': 'application/json'
  }
});

export const getDocumentTypes = () => {
  return api.get('/documents/types');
};

export const getDocumentTemplateByType = (type) => {
  return api.get(`/documents/types/${type}`);
};

export const generateDocument = (docstype, user_inputs, tone_level = 0, zoomdocs_auth_id = null, zoomdocs_user_id = null) => {
  return api.post(`/documents/types/${docstype}/generate`, {
    tone_level,
    user_inputs,
    zoomdocs_auth_id,
    zoomdocs_user_id
  });
};

export const getGeneratedDocument = (type, fileName) => {
  return api.get(`/documents/generated/${type}/${fileName}`, {
    responseType: 'blob' // for file download
  });
};

export const generateUserId = () => {
  return api.post('/auth/user_id/generate');
};

export const checkUserId = (zoomdocs_user_id) => {
  return api.post('/auth/user_id/check', { zoomdocs_user_id });
};

export const getCredits = (zoomdocs_auth_id, zoomdocs_user_id) => {
  return api.post('/credits', { 
    zoomdocs_auth_id,
    zoomdocs_user_id 
  });
};

export const generateUser = () => {
  return api.post('/auth/user/generate', {});
};

export const checkUser = (zoomdocs_auth_id, zoomdocs_user_id) => {
  return api.post('/auth/user/check', {
    zoomdocs_auth_id,
    zoomdocs_user_id
  });
};

export const startUser = (zoomdocs_auth_id, zoomdocs_user_id) => {
  return api.post('/auth/user/start', {
    zoomdocs_auth_id,
    zoomdocs_user_id
  });
};
