import React, { Component } from 'react'
import ImageAndWelcome from '../components/ImageAnWelcome'
import CityList from '../components/CityList'
import SearchCity from '../components/SearchCity'
import axios from 'axios'
import { API } from '../config/api'

const citiesDummy = [
  { id: 74, name: 'Jakarta', country_name: 'Indonesia' },
  { id: 11052, name: 'Bandung', country_name: 'Indonesia' },
  { id: 170, name: 'Bali', country_name: 'Indonesia' },
]
class Home extends Component {
  constructor() {
    super()
    this.state = {
      featuredCities: citiesDummy,
      citiesResultSearch: null,
      keyword: '',
      cityKeywordSearch: ''
    }
  }

  componentDidMount() {
    // this.getFeaturedCities()
  }

  changeKeywordHandler = (event) => {
    this.setState({ keyword: event.target.value });
  }

  getFeaturedCities = () => {
    var url = `${API.zomato.baseUrl}/cities`
    axios.get(url, {
      headers: {
        'user-key': API.zomato.api_key
      },
      params: {
        city_ids: '74,11052,170'
      }
    })
      .then(({ data }) => {
        if (data.status === 'success') {
          this.setState({ featuredCities: data.location_suggestions })
        }
      })
      .catch(err => console.log(err))
  }

  searchHandler = () => {
    let keyword = this.state.keyword
    var url = `${API.zomato.baseUrl}/cities`
    axios.get(url, {
      headers: {
        'user-key': API.zomato.api_key
      },
      params: {
        q: keyword
      }
    })
      .then(({ data }) => {
        if (data.status === 'success') {
          this.setState({ 
            citiesResultSearch: data.location_suggestions, 
            keyword: '',
            cityKeywordSearch: keyword
          })
        }
      })
      .catch(err => console.log(err))
  }

  render() {
    return (
      <>
      <ImageAndWelcome />
      <div className="container" style={{ marginTop: 30, marginBottom: 30 }}>
        <CityList title={'Featured Cities'} cities={this.state.featuredCities} />

        <SearchCity
          value={this.state.keyword}
          onChange={this.changeKeywordHandler}
          onClickSearch={this.searchHandler}
        />

        {
          this.state.cityKeywordSearch !== '' && (
            <CityList
              title={'Search Result'}
              showSubtitle={true}
              subtitle={this.state.cityKeywordSearch}
              cities={this.state.citiesResultSearch}
            />  
          )
        }  

      </div>
      </>
    )
  }
}

export default Home