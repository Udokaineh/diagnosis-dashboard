const userName = "coalition"
const password = "skills-test"
const auth = btoa(`${userName}:${password}`)

const config = {
    API_URL: "https://fedskillstest.coalitiontechnologies.workers.dev",
    AUTH_HEADER: auth
}