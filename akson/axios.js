import axiosRetry from 'axios-retry';
import axios from 'axios';
axiosRetry(axios, { retries: 3, retryDelay: (retryCount) => retryCount * 1000})

export const downloadCategories = async (url) => {
  try {
    const response = await axios.post(url, {"limit":10000,"skip":0 }, {
      headers: {
        'x-akson-sid': 'retail',
        'x-akson-store': '43',
        'content-encoding': 'gzip, deflate, br',
        'content-type': 'application/json'
  
      }
    });
    return await response.data
  } catch (error) {
    console.log(error, url)
    return null
  }
  
}

export const downloadJson = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'x-akson-sid': 'retail',
        'x-akson-store': '43',
        'content-encoding': 'gzip, deflate, br',
        'content-type': 'application/json'
      }
    });
    // console.log(response.data)
    return await response.data
  } catch (error) {
    console.log(error)
    return null
  }
}