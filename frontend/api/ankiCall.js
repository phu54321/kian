import axios from 'axios';

const root = 'http://localhost:28735/';

export async function ankiCall (apiType, data) {
    const response = (await axios.post(root, {
        apiType,
        ...data
    })).data;
    if(response.error) throw new Error(response.error.toString());
    return response.result;
}
