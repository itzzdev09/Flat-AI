import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'


export const searchFlatSlice = createAsyncThunk('search/flat', async (clientData) => {
  const response = await axios.post(`${process.env.REACT_APP_NODE_API_URL}clientData`, clientData)
  return response.data
})

const searchResult = createSlice({
  name:"searchResult",
  initialState:{
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFlatSlice.fulfilled, (state, action) => {
      state.loading = false
      state.data = action.payload;
    })
    .addCase(searchFlatSlice.pending, (state) => {
      state.loading = true
      state.error = null
    })
    .addCase(searchFlatSlice.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message
    })
  }
})



export default searchResult.reducer