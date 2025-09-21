import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CoursesLearner = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [enrollmentStatus, setEnrollmentStatus] = useState({});
    const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const navigate = useNavigate();

    // Fetch both available courses and enrolled courses when component mounts
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            setIsLoading(true);
            try {
                // Fetch all available courses
                const allCoursesResponse = await axios.get('http://localhost:8080/api/course/getAllCourses', {
                    headers: { "Authorization": "Bearer " + token }
                });

                // Fetch enrolled courses for this learner
                const enrolledCoursesResponse = await axios.get('http://localhost:8080/api/learner/courses', {
                    headers: { "Authorization": "Bearer " + token }
                });

                setAllCourses(allCoursesResponse.data || []);
                setFilteredCourses(allCoursesResponse.data || []);
                setEnrolledCourses(enrolledCoursesResponse.data || []);

                // Create enrollment status mapping
                const statusMap = {};
                enrolledCoursesResponse.data.forEach(course => {
                    statusMap[course.id] = true;
                });
                setEnrollmentStatus(statusMap);

            } catch (error) {
                console.error("Error fetching courses:", error);
                setError("Failed to load courses. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Handle search functionality
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCourses(allCourses);
        } else {
            const filtered = allCourses.filter(course =>
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (course.author && course.author.name && course.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredCourses(filtered);
        }
    }, [searchTerm, allCourses]);

    // Handle enrollment
    const handleEnroll = async (courseId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            await axios.post(`http://localhost:8080/api/learner/enroll/${courseId}`, {}, {
                headers: { "Authorization": "Bearer " + token }
            });

            // Update enrollment status
            setEnrollmentStatus(prev => ({
                ...prev,
                [courseId]: true
            }));

            // Add the course to enrolled courses
            const enrolledCourse = allCourses.find(course => course.id === courseId);
            if (enrolledCourse) {
                setEnrolledCourses(prev => [...prev, {...enrolledCourse, progress: 0}]);
            }

            setShowEnrollConfirm(false);
            setSelectedCourse(null);
        } catch (error) {
            console.error("Error enrolling in course:", error);
            setError("Failed to enroll in the course. Please try again.");
        }
    };

    // Show enrollment confirmation modal
    const confirmEnroll = (course) => {
        setSelectedCourse(course);
        setShowEnrollConfirm(true);
    };

    if (isLoading) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading courses...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">Explore Courses</h1>
                <div className="btn-toolbar mb-2 mb-md-0">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-outline-secondary" type="button">
                            <i className="bi bi-search"></i>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {filteredCourses.length === 0 ? (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <i className="bi bi-search fs-1 text-muted"></i>
                    </div>
                    <h4 className="text-muted">No courses found</h4>
                    <p className="text-muted">Try adjusting your search or check back later for new courses.</p>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
                    {filteredCourses.map(course => (
                        <div className="col" key={course.id}>
                            <div className="card h-100 shadow-sm">
                                <div className="position-relative">
                                    <img
                                        src={course.courseImage ? `../images/${course.courseImage}` : 'https://via.placeholder.com/300x200?text=Course+Image'}
                                        className="card-img-top"
                                        alt={course.title}
                                        style={{height: '180px', objectFit: 'cover'}}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x200?text=Course+Image';
                                        }}
                                    />
                                    <div className="position-absolute top-0 end-0 m-2">
                                        <span className="badge bg-primary">{course.credits} Credits</span>
                                    </div>
                                </div>
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{course.title}</h5>
                                    <p className="card-text text-muted mb-1">
                                        {course.author?.name ? `By ${course.author.name}` : 'Unknown Author'}
                                    </p>
                                    <p className="card-text small mb-3">
                                        {course.description ?
                                            (course.description.length > 100 ?
                                                `${course.description.substring(0, 100)}...` : course.description)
                                            : 'No description available'}
                                    </p>
                                    <div className="mt-auto">
                                        {enrollmentStatus[course.id] ? (
                                            <button
                                                className="btn btn-success w-100"
                                                onClick={() => navigate(`/learner/course/${course.id}`)}
                                            >
                                                <i className="bi bi-journal-bookmark me-1"></i> Continue Learning
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-outline-primary w-100"
                                                onClick={() => confirmEnroll(course)}
                                            >
                                                <i className="bi bi-plus-circle me-1"></i> Enroll Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Enrollment Confirmation Modal */}
            {showEnrollConfirm && selectedCourse && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Enroll in Course</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEnrollConfirm(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to enroll in <strong>{selectedCourse.title}</strong>?</p>
                                {selectedCourse.credits > 0 && (
                                    <p className="text-muted">This course requires {selectedCourse.credits} credits.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEnrollConfirm(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={() => handleEnroll(selectedCourse.id)}>
                                    Confirm Enrollment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursesLearner;
