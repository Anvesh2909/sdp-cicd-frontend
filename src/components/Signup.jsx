import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({
        username: "",
        password: "",
        role: "LEARNER"
    });

    // For author specific details - updated field names to match backend
    const [authorData, setAuthorData] = useState({
        fullName: "",
        contact: "",
        website: "",
        profilePic: ""
    });

    const handleUserChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handleAuthorChange = (e) => {
        setAuthorData({
            ...authorData,
            [e.target.name]: e.target.value
        });
    };

    const signup = async () => {
        // Basic validation
        if (!user.username || !user.password) {
            setMsg("Username and password are required");
            return;
        }

        if (user.role === "AUTHOR" && !authorData.fullName) {
            setMsg("Full name is required for authors");
            return;
        }

        setLoading(true);
        setMsg("");

        try {
            console.log("Creating user with data:", user);

            // First create the user account
            const userResponse = await axios.post('http://localhost:8080/api/user/signup', user);
            console.log("User response:", userResponse.data);

            // If user is an author, add author details
            if (user.role === "AUTHOR") {
                const authorPayload = {
                    fullName: authorData.fullName,
                    contact: authorData.contact || null,
                    website: authorData.website || null,
                    profilePic: authorData.profilePic || null,
                    userId: userResponse.data.id || userResponse.data.userId || userResponse.data
                };

                console.log("Creating author with payload:", authorPayload);

                try {
                    // Updated endpoint to match the controller
                    const authorResponse = await axios.post('http://localhost:8080/api/author/register', authorPayload);
                    console.log("Author created successfully:", authorResponse.data);
                } catch (authorError) {
                    console.error("Full author error:", authorError);
                    console.error("Author error response:", authorError.response);
                    setMsg("User created but author profile couldn't be created: " +
                        (authorError.response?.data || authorError.message));
                    setLoading(false);
                    return;
                }
            }

            // If successful, show message and redirect
            setMsg("Registration successful! Redirecting to login...");
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (error) {
            console.error("Signup error:", error);
            console.error("Error response:", error.response);
            setMsg(error.response?.data?.message || error.response?.data || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container'>
            <div className='row'>
                <div className='col-lg-12'>
                    <br /><br /><br /><br />
                </div>
            </div>

            <div className='row'>
                <div className='col-md-3'></div>
                <div className='col-md-6'>
                    <div className='card'>
                        <div className='card-header'>
                            <h4 className="mb-0">Sign Up</h4>
                        </div>
                        <div className='card-body'>
                            {msg && (
                                <div className={`alert ${msg.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
                                    {msg}
                                </div>
                            )}

                            <div className='mb-3'>
                                <label className="form-label">Username *</label>
                                <input
                                    className='form-control'
                                    type="text"
                                    name="username"
                                    value={user.username}
                                    onChange={handleUserChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className='mb-3'>
                                <label className="form-label">Password *</label>
                                <input
                                    className='form-control'
                                    type="password"
                                    name="password"
                                    value={user.password}
                                    onChange={handleUserChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className='mb-3'>
                                <label className="form-label">Role *</label>
                                <select
                                    className='form-control'
                                    name="role"
                                    value={user.role}
                                    onChange={handleUserChange}
                                    disabled={loading}
                                >
                                    <option value="LEARNER">Learner</option>
                                    <option value="AUTHOR">Author</option>
                                </select>
                            </div>

                            {/* Author specific fields */}
                            {user.role === "AUTHOR" && (
                                <>
                                    <hr />
                                    <h6 className="text-muted mb-3">Author Profile Information</h6>

                                    <div className='mb-3'>
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            className='form-control'
                                            type="text"
                                            name="fullName"
                                            value={authorData.fullName}
                                            onChange={handleAuthorChange}
                                            required={user.role === "AUTHOR"}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <label className="form-label">Contact</label>
                                        <input
                                            className='form-control'
                                            type="text"
                                            name="contact"
                                            value={authorData.contact}
                                            onChange={handleAuthorChange}
                                            disabled={loading}
                                            placeholder="Phone number or email"
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <label className="form-label">Website</label>
                                        <input
                                            className='form-control'
                                            type="url"
                                            name="website"
                                            value={authorData.website}
                                            onChange={handleAuthorChange}
                                            disabled={loading}
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <label className="form-label">Profile Picture</label>
                                        <input
                                            className='form-control'
                                            type="text"
                                            name="profilePic"
                                            value={authorData.profilePic}
                                            onChange={handleAuthorChange}
                                            disabled={loading}
                                            placeholder="Profile picture filename"
                                        />
                                        <small className="text-muted">Enter filename of image in your images folder</small>
                                    </div>
                                </>
                            )}

                            <div className='mb-3'>
                                <button
                                    onClick={signup}
                                    className='btn btn-primary w-100'
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="card-footer text-center">
                            Already have an account?
                            <span
                                className="text-primary ms-1"
                                style={{cursor: 'pointer', textDecoration: 'underline'}}
                                onClick={() => navigate('/')}
                            >
                                Login here
                            </span>
                        </div>
                    </div>
                </div>
                <div className="col-md-3"></div>
            </div>
        </div>
    );
};

export default Signup;