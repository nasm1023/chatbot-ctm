import axios from 'axios'

export const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api', // change this to api
    headers: {
        'Content-Type': 'application/json',
    },
})

export default apiClient
