import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
const Profile = () => {
  const [author, setAuthor] = useState(null);
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
  },[])
  return (
    <div className='container-fluid'>
      <div className='card ' style={{ maxWidth: "500px" }}>

        <div className='card-body '>
          <div>
            <label htmlFor="">Name:</label>
            <input type="text" className='form-control' value={author?.fullName} disabled />


          </div>
          <div>

            <label htmlFor="">Contact</label>
            <input type="text" className='form-control' value={author?.contact} disabled />

          </div>
          <div>
            <label htmlFor="">ProfilePic</label> <br />
            <div className='rounded m-2'>
               <img src={`/images/${author?.profilePic}`} height={100} />

            </div>
           
          </div>
          <Link to={"/author/edit-profile"} className="btn btn-primary">Edit Profile</Link>
        </div>

      </div>
    </div>
  )
}

export default Profile