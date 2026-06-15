import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// The thunk fetches paginated data.
export const fetchAllData = createAsyncThunk('allProperty/fetchData', async (page) => {
  const response = await axios.post(`${process.env.REACT_APP_NODE_API_URL}allData/${page}`)
  return response.data
})

// The slice handles data fetching, loading, and pagination.
const allDataSlice = createSlice({
  name: 'allData',
  initialState: {
    data: [],
    total: 0,
    limit: 12,
    loading: false,
    error: null,
    hasMoreData: true,
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled state
      .addCase(fetchAllData.fulfilled, (state, action) => {
        const fetchedData = action.payload

        if (fetchedData && typeof fetchedData === 'object' && !Array.isArray(fetchedData)) {
          state.data = fetchedData.flats || []
          state.total = fetchedData.total || 0
          state.limit = fetchedData.limit || 12
        } else {
          state.data = fetchedData || []
          state.total = fetchedData ? fetchedData.length : 0
          state.limit = 12
        }
        state.hasMoreData = state.data.length >= state.limit
        state.loading = false
        state.error = null
      })
      // Pending state
      .addCase(fetchAllData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Rejected state
      .addCase(fetchAllData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

// The reducer is exported here.
export default allDataSlice.reducer
