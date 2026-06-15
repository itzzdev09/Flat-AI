import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the async thunk for fetching recommendations
export const fetchData = createAsyncThunk(
  'Prediction_Suggestion/fetchData',
  async (data) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_NODE_API_URL}prediction-recommendation/`, data);
      return response.data; 
    } catch (error) {
      throw error; 
    }
  }
);

// Define the slice
export const RecommendationSlice = createSlice({
  name: 'predictionSuggestion',
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;  
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;  
      });
  },
});

export default RecommendationSlice.reducer;
