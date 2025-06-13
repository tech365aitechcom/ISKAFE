import axios from 'axios'

import { API_BASE_URL } from '../constants'

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(async (config) => {
  let token =
    typeof window !== 'undefined' ? window.localStorage.getItem('_token') : ''

  if (token) {
    config.headers['Authorization'] = `${token}`
  }
  return Promise.resolve(config)
})

instance.interceptors.response.use(async (response) => {
  return response
})

export default instance
