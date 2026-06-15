import React, { useEffect, useMemo, useState } from 'react'
import LocationAnalysis from '../Components/Analysis/LocationAnalysis'
import BarPlot from '../Components/Analysis/Barplot'
import Poster from '../Components/Analysis/Poster'
import BoxPlot from '../Components/Analysis/BoxPlot'
import { fetchData } from '../Components/Analysis/FetchData'
import Loading from '../Components/Sections/Loading'
import HistogramPlot from '../Components/Analysis/HistogramPlot'
import InsightCards from '../Components/Analysis/InsightCards'
import { filterByLocation } from '../Components/Analysis/analysisHelpers'

const AnalysisPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [locationInput, setLocationInput] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchData()
        setData(response)
      } catch (err) {
        setError(err.message || 'Unable to load analytics data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredData = useMemo(
    () => filterByLocation(data, locationInput),
    [data, locationInput]
  )
  const locationSuggestions = useMemo(
    () => [...new Set(data.map((item) => item.location).filter(Boolean))].sort(),
    [data]
  )

  if (loading) return <Loading />

  if (error) {
    return (
      <section className="section-shell">
        <div className="feature-band text-center">
          <h2>Analytics unavailable</h2>
          <p className="mb-0">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <Poster data={filteredData} />
      <InsightCards data={filteredData} />
      <LocationAnalysis
        data={filteredData}
        locationInput={locationInput}
        setLocationInput={setLocationInput}
        suggestions={locationSuggestions}
        totalListings={data.length}
      />
      <BarPlot data={filteredData} />
      <HistogramPlot data={filteredData} />
      <BoxPlot data={filteredData} />
    </>
  )
}

export default AnalysisPage
