import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'


const CourseDetails = () => {
    const params = useParams();
    const [videos, setVideos] = useState([]);
    const [modules, setModules] = useState([]);
    const [course, setCourse] = useState([]);
    const [module, setModule] = useState(false);
    const [video, setVideo] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [show, setShow] = useState(false);
    useEffect(() => {
        const getAllVideosWithModules = async () => {

            try {
                let token = localStorage.getItem('token');
                const response = await axios.get("http://localhost:8080/api/video/getAllVideos/" + params.cid, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                // console.log(response);
                setVideos(response.data);
                let temp = [];
                response.data.forEach((e) => {

                    temp.push(e.module);

                })
                let tempDup = [];
                temp.forEach((e) => {
                    if (!tempDup.find(m => m.id === e.id))
                        tempDup.push(e);
                })
                setModules(tempDup);

                setCourse(tempDup.map((m) => m.course));
                // console.log(course);

                


            } catch (error) {
                console.log(error);
            }
        }
        getAllVideosWithModules();

        const getReviews = async () => {
            try {
                 let token = localStorage.getItem('token');
                const response = await axios.get("http://localhost:8080/api/review/getReviewsByCourse/" + params.cid,{
                    headers: { 'Authorization': 'Bearer ' + token }
                })
                console.log(response);
                setReviews(response.data);
            } catch (error) {
                console.log(error);
            }

        }
        getReviews();
    }, [])

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-lg-12">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a href="#">Author Dashboard</a></li>
                            <li className="breadcrumb-item"><a href="#">Courses</a></li>
                            <li className="breadcrumb-item active" aria-current="page">Cuourse Details</li>
                        </ol>
                    </nav>
                </div>
            </div>
            <div className="col=lg-12 ">
                {
                    course.map((c, index) => (
                        <div key={index}>
                            <div className="card mt-2">
                                <h3>{c.title}: {params.cid}</h3>
                                <div className="card-body">
                                    {c.credits}
                                </div>
                            </div>
                        </div>
                    ))
                }

            </div>
            <div className="col-lg-12 mt-4" >
                <div>
                    <span style={{ padding: '10px' }}>
                        <button onClick={() => setModule(!module)} className="btn btn-primary" >
                            Modules
                        </button>
                    </span>
                    &nbsp;&nbsp;
                    <span style={{ padding: '10px' }}>
                        <button onClick={() => setVideo(!video)} className="btn btn-info" >
                            Videos
                        </button></span>
                    <span style={{ padding: '10px' }}>  <button  onClick={()=>setShow(!show)} className="btn btn-secondary" type="button" >
                        Author Profilee
                    </button></span>
                    <span style={{ padding: '10px' }}> <button onClick={()=>setShow(!show)} className="btn btn-warning" type="button" >
                        Reviews
                    </button></span>
                </div>
                {
                    module === true ? <div >
                        <div className="card card-body">
                            <h4>All Modules</h4>
                            {modules.map((m, index) => (
                                <div key={index}>
                                    <li>{m.moduleTitle}</li>
                                </div>
                            ))}
                        </div>
                    </div> : ""
                }
                {
                    video === true ?
                        <div >
                            <div className="card card-body">
                                <h4> All Videos </h4>
                                {
                                    modules.map((m, index) => (
                                        <div key={index}>
                                            <h6>{m.moduleTitle}</h6>
                                            {
                                                videos.map((v, index) => (
                                                    <div key={index}>
                                                        {m.id === v.module.id ? <li>{v.videoTitle} &nbsp; {v.playTime} mins</li> : ""}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    ))
                                }
                            </div>
                        </div> : ""
                }



                {show === true ? <div >
                    <div className="card card-body">
                        {
                            course.map((c, index) => (
                                <>
                                    <h4>{c.author.fullName}</h4>
                                    <p>{c.author.contact}</p>
                                </>

                            ))
                        }
                    </div>
                </div>: ""}

                {show === true ? <div>
                    {
                        reviews.map((r) => (
                            <div className="card card-body">
                                <div className='card-header'>
                                    Review {r.id} <br/>``
                                    Comment: {r.comments} <br />
                                    Rating: {r.rating}
                                </div>
                                <div className='card-text'>
                                    By: {r.learnerCourse.learner.name}
                                </div>
                            </div>
                        ))
                    }

                </div>: ""}
            </div>


        </div >
    )
}

export default CourseDetails