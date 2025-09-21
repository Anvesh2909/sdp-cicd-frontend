import axios from 'axios';
import React, { useEffect, useState } from 'react'
const EditProfile = () => {
    const [author, setAuthor] = useState(null);
    const [profile, setProfile] = useState("");

    const upload = async () => {
        const formData = new FormData();
        formData.append("file", profile)
        try {
            const response = await axios.post("http://localhost:8080/api/author/upload/profile-pic", formData,
                {
                    headers:
                        { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                })
            console.log(response.data);

        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        const getAuthor = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/author/get", {
                    headers: { 'Authorization': "Bearer " + localStorage.getItem('token') }
                })

                console.log(response.data);
                setAuthor(response.data);

            } catch (error) {
                console.log(error);
            }
        }
        getAuthor();
    }, [])
    return (
        <div className='container-fluid'>
            <div className='card ' style={{ maxWidth: "500px" }}>

                <div className='card-body '>
                    <div>
                        <label htmlFor="">Name:</label>
                        <input type="text" className='form-control' value={author?.fullName} />
                    </div>
                    <div>

                        <label htmlFor="">Contact</label>
                        <input type="text" className='form-control' value={author?.contact} />

                    </div>
                    <div>
                        <label htmlFor="">ProfilePic</label> <br />
                        <div className='rounded m-2'>
                            <img src={`/images/${author?.profilePic}`} height={100} />
                        </div>
                        <input type="file" onChange={($e) => { setProfile($e.target.files[0]) }} />
                    </div>
                    <button className='btn btn-primary' onClick={upload}>Edit</button>
                </div>
            </div>
        </div>
    )
}

export default EditProfile