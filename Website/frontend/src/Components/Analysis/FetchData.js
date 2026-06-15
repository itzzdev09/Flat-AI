
import axios from 'axios'

export const fetchData = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_NODE_API_URL}allfilteredData`)
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}
