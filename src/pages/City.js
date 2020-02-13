import React, { Component } from 'react'

import axios from 'axios'
import { API } from '../config/api'
import CategoryList from '../components/CategoryList'
import SearchKeyword from '../components/SearchKeyword'
import SearchCriteria from '../components/SearchCriteria'
import RestaurantCard from '../components/RestaurantCard'

class City extends Component {
  constructor() {
    super()
    this.state = {
      city: null,
      categories: null,
      categorySelected: null,
      keyword: '',
      criteria: [],
      restaurants: []
    }
  }
  
  componentDidMount() {
    // cara mendapatkan parameter city_id dari url / route
    let { city_id } = this.props.match.params
    this.getCityData(city_id)

    this.getCategoriesData()
  }

  getCityData = (city_id) => {
    let url = `${API.zomato.baseUrl}/cities`
    axios.get(url, {
      headers: {
        'user-key': API.zomato.api_key
      },
      params: {
        city_ids: `${city_id}`
      }
    })
      .then(({ data }) => {
        let city = data.location_suggestions[0]
        let newCriteria = {
          criteriaName: 'City',
          data: city
        }
        let criteria = [...this.state.criteria]
        criteria.push(newCriteria)
        this.setState({ city, criteria })
      })
      .catch(err => console.log(err))
  }

  getCategoriesData = () => {
    let url = `${API.zomato.baseUrl}/categories`
    axios.get(url, {
      headers: {
        'user-key': API.zomato.api_key
      }
    })
      .then(({ data }) => {
        // proses transform data categories
        let categories = this.transformCategoriesData(data.categories)
        this.setState({ categories })
      })
      .catch(err => console.log(err))
  }


  transformCategoriesData(categories) {
    let categoriesTransformed = categories.map(category => {
      return category.categories
    })

    return categoriesTransformed
  }

  categoryClickHandler = (category) => {
    let criteria = [...this.state.criteria]
    // ambil element array selain element dengan criteriaName 'Category' 
    criteria = criteria.filter(cri => cri.criteriaName !== 'Category')
    let newCriteria = {
      criteriaName: 'Category',
      data: category
    }
    criteria.push(newCriteria)
    this.setState({ categorySelected: category, criteria })
  }

  changeKeywordHandler = (event) => {
    this.setState({ keyword: event.target.value });
  }

  addToCriteriaHandler = () => {
    let criteria = [...this.state.criteria]
    criteria = criteria.filter(cri => cri.criteriaName !== 'Keyword')
    let newCriteria = {
      criteriaName: 'Keyword',
      data: {
        name: this.state.keyword
      }
    }

    criteria.push(newCriteria)
    this.setState({ keyword: '', criteria })
  }

  removeCriteriaHandler = (index) => {
    let criteria = [...this.state.criteria]
    criteria.splice(index, 1)
    this.setState({ criteria })
  }

  searchHandler = () => {
    this.setState({restaurants: null})
    let url = `${API.zomato.baseUrl}/search`
    let params = {}

    for (let cri of this.state.criteria) {

      switch (cri.criteriaName) {
        case 'City':
          params.entity_id = cri.data.id
          params.entity_type = 'city'
          break
        case 'Category':
          params.category = cri.data.id
          break
        case 'Keyword':
          params.q = cri.data.name
          break
        default: break
      }
    }

    axios.get(url, {
      headers: {
        'user-key': API.zomato.api_key
      },
      params
    })
      .then(({ data }) => {
        this.setState({ restaurants: data.restaurants })
      })
      .catch(err => console.log(err))
  }


  renderRestaurantList = () => {
    if(this.state.restaurants == null) {
      return (
        <div className="col">
          <p>Loading...</p> 
        </div>
      )
    }

    if(this.state.restaurants.length > 0) {
      return (
        this.state.restaurants.map(({ restaurant }) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))
      )
    } else {
      return (
        <div className="col">
          <p>No Data available. Please select criteria, and click Search</p>
        </div>
      )
    }
  }

  render(){
    return (
      <div className="container-fluid" style={{ marginTop: 30, marginBottom: 30 }}>
        { this.state.city && (
          <div className="row">
            <div className="col">
              <h4 className="text-success">
                Restaurant in { this.state.city.name }, { this.state.city.country_name }
              </h4>
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-3">
            <h5>Categories</h5>
            <CategoryList 
              categories={this.state.categories}
              categorySelected={this.state.categorySelected}
              categoryClickHandler={(category) => this.categoryClickHandler(category)}
            />
          </div>

          <div className="col">
            <SearchKeyword
              keyword={this.state.keyword}
              changeKeywordHandler={this.changeKeywordHandler}
              onClickAddToCriteria={this.addToCriteriaHandler}
            />
            <SearchCriteria 
              criteria={this.state.criteria}
              removeCriteriaHandler={(index) => this.removeCriteriaHandler(index)}
              onClickSearch={this.searchHandler}
            />

            <div className="row">
              <div className="col" style={{ marginBottom: 10 }}>
                <h4 className="text-success">Restaurant List</h4>
              </div>
            </div>
            <div className="row">
              { this.renderRestaurantList() }
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export default City