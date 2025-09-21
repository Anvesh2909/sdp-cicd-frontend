import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { setUserDetails } from '../store/actions/UserAction';
import { useDispatch } from 'react-redux';

const Login = () => {
    const navigate = useNavigate();
    const [msg, setMsg] = useState("");
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();

    const login = async () => {
        try {
            // Step 1: Login with username/password to get JWT token
            const loginResponse = await axios.post('http://54.234.194.193:8080/api/user/login', {
                username: username,
                password: password
            });

            console.log("Login response:", loginResponse.data);

            // Check if login was successful and token exists
            if (!loginResponse.data || !loginResponse.data.token) {
                setMsg("Login failed: No token received");
                return;
            }

            const token = loginResponse.data.token;
            console.log("JWT Token:", token);

            // Step 2: Store token in localStorage
            localStorage.setItem('token', token);

            // Step 3: Set default Authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Step 4: Get user details using the JWT token
            const detailsResponse = await axios.get("http://54.234.194.193:8080/api/user/details", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            console.log("Details response:", detailsResponse);
            console.log("Details data:", detailsResponse.data);

            // Check if the response structure is correct
            if (!detailsResponse.data) {
                setMsg("Error: Invalid response from server");
                return;
            }

            // Extract role from response
            let role;
            let userDetails = detailsResponse.data;

            if (userDetails.role) {
                role = userDetails.role;
            } else {
                console.error("Role not found in response:", userDetails);
                setMsg("Error: Role information not found");
                return;
            }

            console.log("User role:", role);

            // Create user object for Redux store
            let user = {
                'username': username,
                'role': role,
                'id': userDetails.id || null
            }

            // Dispatch user details to Redux store
            setUserDetails(dispatch)(user);

            // Navigate based on role
            switch (role) {
                case "LEARNER":
                    navigate("/learner");
                    break;
                case "AUTHOR":
                    navigate("/author");
                    break;
                case "EXECUTIVE":
                    navigate("/executive");
                    break;
                default:
                    setMsg("SOMETHING WENT WRONG: Unknown role " + role);
                    return;
            }

            setMsg("Login Successful");

        } catch (error) {
            console.log("Login error:", error);

            // Clear any stored token on error
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];

            if (error.response) {
                // Server responded with error status
                console.log("Error response:", error.response.data);
                const errorMessage = error.response.data.error ||
                    error.response.data.message ||
                    "Server error";
                setMsg("Login failed: " + errorMessage);
            } else if (error.request) {
                // Network error
                setMsg("Network error: Please check your connection");
            } else {
                // Other error
                setMsg("Login failed: " + error.message);
            }
        }
    }

    return (
        <div className='container'>
            <div className='row'>
                <div className='col-lg-12'>
                    <br /><br /><br /><br />
                </div>
            </div>

            <div className='row'>
                <div className='col-md-3'></div>
                <div className='col-md-5'>
                    <div className='card'>
                        <div className='card-header'>
                            Login
                        </div>
                        <div className='card-body'>
                            {msg !== "" ? <div>
                                <div className={`alert ${msg.includes("Successful") ? "alert-success" : "alert-danger"}`}>
                                    {msg}
                                </div>
                            </div> : ""}
                            <form onSubmit={(e) => { e.preventDefault(); login(); }}>
                                <div className='mb-2'>
                                    <label htmlFor="username">Enter Username: </label>
                                    <input
                                        id="username"
                                        className='form-control'
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='mb-2'>
                                    <label htmlFor="password">Enter Password: </label>
                                    <input
                                        id="password"
                                        className='form-control'
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='mb-3'>
                                    <button
                                        type="submit"
                                        className='btn btn-primary'
                                        disabled={!username || !password}
                                    >
                                        Login
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="card-footer">
                            Don't have an Account? <span className="text-primary" style={{cursor: 'pointer'}} onClick={() => navigate('/signup')}>Sign Up here</span>
                        </div>
                    </div>
                </div>
                <div className="col-md-3"></div>
            </div>
        </div>
    )
}

export default Login