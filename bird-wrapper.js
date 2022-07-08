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

        // random location because some endpoints need it in the header
        // can be set by user with setLocation
        this.location = {
            latitude: '52.520008',
            longitude: '13.404954',
            altitude: 500,
            speed: -1,
            heading: -1
        }

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

    setAccessToken(token) {
        // TODO: (better?) way to save access token
        this.accessToken = `Bearer ${token}`
    }

    setLocation(latitude, longitude) {
        this.location = {
            latitude,
            longitude,
            altitude: 500,
            speed: -1,
            heading: -1
        }
    }

    /**
     * Authenticate using email
     * If it's first time for the email, new account is registered.
     * Otherwise you'll have to verify email
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

            const { validation_required } = response.data

            if (!validation_required) {
                this.setAccessToken(response.data.tokens.access)
            }

            return {data: response.data, email}
        } catch (error) {
            return error
        }
    }

    /**
     * Verify email
     * @date 2022-07-04
     * @param {string} token Verification token
     * @returns {object} Profile data
     */
    async verifyEmail(token) {
        try {
            let response = await this.authRequest({
                'method': 'POST',
                'url': '/auth/magic-link/use',
                'data': {
                    'token': token
                },
                'responseType': 'json'
            });
            this.setAccessToken(response.data.access);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    /**
     * Get profile (requires auth token)
     * @date 2022-07-04
     * @returns {object} Profile data
     */
    async getProfile() {
        try {
            if (!this.accessToken) {
                throw {msg: 'Not authorized. Please authEmail()'}
            }

            let response = await this.request({
                method: 'GET',
                url: '/user',
                responseType: 'json',
                headers: {
                    Authorization: this.accessToken,
                    Location: JSON.stringify(this.location)
                }
            })
            return response.data

        } catch (error) {
            return error
        }
    }

    /**
     * Requires access token
     * Gets every bird of a location (apparently, radius is not working)
     * @date 2022-07-03
     * @param {number} radius=500
     * @returns {object} Response data or error data
     */
    async getNearbyBirds(radius = 500) {
        try {
    
            if (!this.accessToken) {
                throw {msg: 'Not authorized. Please authEmail()'}
            }

            let response = await this.request({
                method: 'GET',
                url: '/bird/nearby',
                params: {
                    latitude: this.location.latitude,
                    longitude: this.location.longitude,
                    radius
                },
                headers: {
                    Location: JSON.stringify(this.location),
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
