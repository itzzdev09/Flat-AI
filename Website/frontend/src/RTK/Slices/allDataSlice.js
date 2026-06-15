import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Thunk to fetch paginated data
export const fetchAllData = createAsyncThunk('allProperty/fetchData', async (page) => {
  const response = await axios.post(`${process.env.REACT_APP_NODE_API_URL}allData/${page}`)
  return response.data
})

// Slice to handle data fetching, loading, and pagination
const allDataSlice = createSlice({
  name: 'allData',
  initialState: {
    data: [],
    loading: false,
    error: null,
    hasMoreData: true,
  },
  extraReducers: (builder) => {
    builder
      // fulfilled
      .addCase(fetchAllData.fulfilled, (state, action) => {
        const fetchedData = action.payload

        if (fetchedData.length !== 0) {
          state.data.push(...fetchedData)
          state.hasMoreData = true
        } else {
          state.hasMoreData = false
        }
        state.loading = false
        state.error = null
      })
      //pending
      .addCase(fetchAllData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      //rejected
      .addCase(fetchAllData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

// Export the reducer
export default allDataSlice.reducer
