const axios = require('axios')
const moment = require('moment')
const { v4: uuidv4 } = require('uuid');

class BirdApi {

    /**
     * @param {object} options={} Additional request options eg. headers
     */
    constructor(options = {}) {

        // Fake device id for api instance
        this.deviceId = uuidv4().toUpperCase()

        // Mandatory headers
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Device-Id': this.deviceId,
            'platform': 'ios',
            'App-Name': 'bird',
            'App-Version' : '4.195',
            'App-Type': 'rider',
            'User-Agent': 'Bird/4.195.0 (co.bird.Ride; build:5; iOS 14.3.0) Alamofire/4.195.0'
        }

        // Boilerplate for BIRD api request
        this.request = axios.create({
            'baseURL': 'https://api-bird.prod.birdapp.com',
            'headers': this.defaultHeaders, 
            ...options
        })

        // Boilerplate for AUTH api request
        this.authRequest = axios.create({
            'baseURL': 'https://api-auth.prod.birdapp.com',
            'headers': this.defaultHeaders, 
            ...options
        })
    }

    /*
     * @param {string} token Access token
     */
    setAccessToken(token) {
        // TODO: (better?) way to save access token
        this.accessToken = `Bearer ${token}`
    }

    /**
     * Login using email. (Saves access token to instance)
     * If it's first time for the email, new account is registered.
     * @date 2022-07-03
     * @param {string} email
     * @returns {object} Response data | error data
     */
    async authEmail(email) {
        try {
            if (!email)
                throw {msg: 'Please provide an email'}

            let response = await this.authRequest({
                method: 'POST',
                url: '/api/v1/auth/email',
                data: {
                    email
                },
                reponseType: 'json'
            })
            this.setAccessToken(response.data.tokens.access)
            return {data: response.data, email}
        } catch (error) {
            return error
        }
    }

    /**
     * Requires access token
     * Gets every bird of a location in a certain radius
     * @date 2022-07-03
     * @param {string} latitude Latitude coordinates of the location
     * @param {string} longitude Longitude coordinates of the location
     * @param {number} radius=500
     * @returns {object} Response data or error data
     */
    async getNearbyBirds(latitude, longitude, radius = 500) {
        try {
            if (!latitude || !longitude) {
                throw {msg: 'Please provide latitude and longitude'}
            }
    
            if (!this.accessToken) {
                throw {msg: 'Not authorized. Please authEmail()'}
            }

            let response = await this.request({
                method: 'GET',
                url: '/bird/nearby',
                params: {
                    latitude,
                    longitude,
                    radius
                },
                headers: {
                    Location: JSON.stringify({
                        latitude,
                        longitude,
                        altitude: 500,
                        accuracy: 100,
                        speed: -1,
                        heading: -1
                    }),
                    Authorization: this.accessToken
                }, 
                responseType: 'json'
            })
            return response.data   

        } catch (error) {
            return error
        }
    }

}

module.exports = BirdApi
