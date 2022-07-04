const BirdApi = require('./bird-wrapper')

const bird = new BirdApi()

const init = async () => {

    // Authenticate with email
    await bird.authEmail("mock email here")

    // Set location to center of berlin
    bird.setLocation('65.013207', '25.472837')

    // Get every nearby bird
    const nearbyBirds = await bird.getNearbyBirds()

    // get user profile
    const profile = await bird.getProfile()
}

init()