
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'



//api example:  http://localhost:5000/api/singleProperty/66eed19b61014329315fb19a

// Define the async thunk for fetching user data
export const fetchData = createAsyncThunk('SingleProperty/fetchData', async (id) => {
  const response = await axios.post(`${process.env.REACT_APP_NODE_API_URL}singleProperty/${id}`)
  return response.data
})
// Define the user slice
export const PropertyDetailsSlice = createSlice({
  name: 'ProductDetails',
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})
export default PropertyDetailsSlice.reducer