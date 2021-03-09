import axios, { AxiosInstance } from "axios";

const axiosRngSever: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

export default axiosRngSever;