import axios from 'axios'

const root = 'http://localhost:5000/'

export async function getKian(apiPath) {
    const response = (await axios.get(root + apiPath)).data;
    if(response.error) throw new Error(response.error.toString());
    return response.result;
}
