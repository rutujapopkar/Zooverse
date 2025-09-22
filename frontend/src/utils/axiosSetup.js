import axios from 'axios'

// Single initialization guard (in case imported multiple times)
if(!axios.__ZOOVERSE_INTERCEPTORS_ADDED__){
  axios.__ZOOVERSE_INTERCEPTORS_ADDED__ = true

  axios.interceptors.request.use(cfg => {
    // Inject Authorization header if token exists and header not explicitly set
    if(cfg && !cfg.headers?.Authorization){
      const token = localStorage.getItem('token')
      if(token){
        cfg.headers = cfg.headers || {}
        cfg.headers.Authorization = `Bearer ${token}`
      }
    }
    return cfg
  }, err => Promise.reject(err))

  axios.interceptors.response.use(resp => resp, err => {
    if(err?.response?.status === 401){
      // Potential future: trigger refresh flow or redirect to login
      // For now just log to consolidate debugging
      console.warn('401 response captured by interceptor:', err.response?.config?.url)
    }
    return Promise.reject(err)
  })
}

export default axios
