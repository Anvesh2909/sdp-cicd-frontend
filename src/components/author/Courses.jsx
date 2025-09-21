import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [debugInfo, setDebugInfo] = useState(''); // Add debug info
    const [newCourse, setNewCourse] = useState({
        title: '',
        credits: '',
        courseImage: ''
    });

    const API_BASE_URL = "http://localhost:8080/api/course";
    const token = localStorage.getItem('token');

    useEffect(() => {
        getCourses();
    }, []);

    const getCourses = async () => {
        setLoading(true);
        setDebugInfo('Fetching courses...');

        try {
            console.log('Token:', token ? 'Present' : 'Missing');
            console.log('API URL:', `${API_BASE_URL}/getCoursesByAuthor`);

            const response = await fetch(`${API_BASE_URL}/getCoursesByAuthor`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                setDebugInfo(`HTTP ${response.status}: ${errorText}`);
                throw new Error(`Failed to fetch courses: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('Courses data received:', data);

            setCourses(data);
            setError('');
            setDebugInfo(`Successfully loaded ${data.length} courses`);

        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to load courses. Please try again.');
            setDebugInfo(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCourse(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('Submitting course:', newCourse);

            const response = await fetch(`${API_BASE_URL}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newCourse.title,
                    credits: parseFloat(newCourse.credits),
                    courseImage: newCourse.courseImage
                })
            });

            console.log('Add course response status:', response.status);

            if (response.ok) {
                const responseText = await response.text();
                console.log('Add course success:', responseText);
                setSuccess('Course added successfully!');
                setNewCourse({ title: '', credits: '', courseImage: '' });
                setShowAddCourse(false);
                getCourses(); // Refresh the courses list
            } else {
                const errorText = await response.text();
                console.log('Add course error:', errorText);
                throw new Error(`Failed to add course: ${response.status}`);
            }
        } catch (error) {
            console.error('Error adding course:', error);
            setError('Failed to add course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowAddCourse(false);
        setNewCourse({ title: '', credits: '', courseImage: '' });
        setError('');
        setSuccess('');
    };

    // Check if user is authenticated
    const isAuthenticated = !!token;

    if (!isAuthenticated) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">
                    <h4>Authentication Required</h4>
                    <p>Please log in to view your courses.</p>
                </div>
            </div>
        );
    }

    if (loading && courses.length === 0) {
        return (
            <div className="container mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2">Loading courses...</p>
                    {debugInfo && (
                        <small className="text-muted d-block mt-2">Debug: {debugInfo}</small>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Debug Information (remove in production) */}
            {debugInfo && (
                <div className="alert alert-info alert-dismissible fade show" role="alert">
                    <strong>Debug Info:</strong> {debugInfo}
                    <button type="button" className="btn-close" onClick={() => setDebugInfo('')}></button>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2">My Courses</h1>
                <button
                    className="btn btn-success"
                    onClick={() => setShowAddCourse(true)}
                    disabled={loading}
                >
                    <i className="fas fa-plus me-2"></i>
                    Add New Course
                </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
            )}

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Add Course Modal */}
            {showAddCourse && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Course</h5>
                                <button type="button" className="btn-close" onClick={handleCancel}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">Course Title *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="title"
                                            name="title"
                                            value={newCourse.title}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter course title"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="credits" className="form-label">Credits *</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            className="form-control"
                                            id="credits"
                                            name="credits"
                                            value={newCourse.credits}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter course credits"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="courseImage" className="form-label">Course Image</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="courseImage"
                                            name="courseImage"
                                            value={newCourse.courseImage}
                                            onChange={handleInputChange}
                                            placeholder="Enter image filename (e.g., course1.jpg)"
                                        />
                                        <div className="form-text">
                                            Enter the filename of the image in your images folder
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Adding...
                                            </>
                                        ) : (
                                            'Add Course'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Courses Grid */}
            {courses.length === 0 && !loading ? (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <i className="fas fa-book-open fa-3x text-muted"></i>
                    </div>
                    <h4 className="text-muted">No courses found</h4>
                    <p className="text-muted">You haven't created any courses yet. Click "Add New Course" to get started!</p>
                </div>
            ) : (
                <div className="row">
                    {courses.map((course, index) => (
                        <div className="col-md-4 col-lg-3 mb-4" key={course.id || index}>
                            <div className="card h-100 shadow-sm">
                                <div className="position-relative">
                                    <img
                                        src={course.courseImage ? `../images/${course.courseImage}` : 'https://via.placeholder.com/300x200?text=Course+Image'}
                                        className="card-img-top"
                                        alt={course.title}
                                        style={{height: '200px', objectFit: 'cover'}}
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
                                    <p className="card-text text-muted flex-grow-1">
                                        {course.author?.name ? `By ${course.author.name}` : 'By You'}
                                    </p>
                                    <div className="mt-auto">
                                        <Link
                                            className="btn btn-primary w-100"
                                            to={`/author/course-details/${course.id}`}
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {courses.length > 0 && (
                <div className="mt-4 text-center">
                    <small className="text-muted">
                        Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
                    </small>
                </div>
            )}
        </div>
    );
};

export default Courses;