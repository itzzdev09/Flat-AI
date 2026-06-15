import { configureStore } from '@reduxjs/toolkit'
import searchResultReducer from './Slices/SearchSlice'
import allDataReducer from './Slices/allDataSlice'
import propertyDetailsReducer  from './Slices/PropertyDetailsSlice'
import predictionSuggestionReducer from './Slices/PredictionRecommendationSlice'


export const store = configureStore({
  reducer: {
    // This name is being reflected to redux chrome extension.
    searchResult: searchResultReducer,
    allData: allDataReducer,
    propertyDetails: propertyDetailsReducer,
    predictionSuggestion : predictionSuggestionReducer
  },
})

