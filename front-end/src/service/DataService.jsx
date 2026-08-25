import axios from "axios";
const API =  import.meta.env.VITE_API_URL;

export const fetchSchedule =async()=>{
    try {
        const respone = await axios.get(`${API}/schedule`);
        if(respone){
            return respone.data;
        }
    } catch (error) {
        console.log(error);
        
    }
}
export const fetchLeather =async()=>{
    try {
        const respone = await axios.get(`${API}/leather`);
        if(respone){
            console.log("here your data", respone);
            return respone.data;
        }
    } catch (error) {
        console.log(error);
        
    }
}

export const SearchLeatherByMaterial= async(key)=>{
    try {
        const response = await axios.post(`${API}/leather/search?name=${key}`,{});
        if(response){
            console.log("the lea", response);
            return response.data
        }
    } catch (error) {
        console.log(error);
        
    }
}
export const SearchScheduleByModelNo= async(key)=>{
    try {
        const response = await axios.post(`${API}/schedule/search?name=${key}`,{});
        if(response){
            console.log("the sche", response);
            return response.data
        }
    } catch (error) {
        console.log(error);
        
    }
}