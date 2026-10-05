import axios from "axios";

// Create Axios instance
const api = axios.create({
    baseURL: "http://localhost:5000"
});

// Automatically attach JWT token
api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        // IMPORTANT:
        // When sending FormData, let the browser
        // automatically set multipart/form-data
        // with the correct boundary.
        if (config.data instanceof FormData) {

            delete config.headers["Content-Type"];

        } else {

            config.headers["Content-Type"] =
                "application/json";
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle responses/errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {

        if (error.response?.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }

        return Promise.reject(error);
    }
);

export default api;