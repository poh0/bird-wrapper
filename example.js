const BirdApi = require('./bird-wrapper')

const bird = new BirdApi()

const init = async () => {

    await bird.authEmail("mock email here")

    // Get every bird from center of Berlin with radius of 500
    const res = await bird.getNearbyBirds('52.520008', '13.404954')
    console.log(res)
}

init()