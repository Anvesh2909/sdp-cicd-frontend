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
        const encodedString = window.btoa(username + ":" + password);

        try {
            const response = await axios.get('http://localhost:8080/api/user/token', {
                headers: {
                    "Authorization": "Basic " + encodedString
                }
            })
            console.log(response)
            let token = response.data.token;
            console.log(token);

            localStorage.setItem('token', token);

            let details = await axios.get("http://localhost:8080/api/user/details", {
                headers: { "Authorization": "Bearer " + token }
            })

            // Debug: Log the entire response to see its structure
            console.log("Details response:", details);
            console.log("Details data:", details.data);

            // Check if the response structure is correct
            if (!details.data || (typeof details.data === 'string' && details.data === '')) {
                setMsg("Error: Invalid response from server");
                return;
            }

            // Try different possible response structures
            let role;
            if (details.data.user && details.data.user.role) {
                // Nested user object structure
                role = details.data.user.role;
            } else if (details.data.role) {
                // Direct role property
                role = details.data.role;
            } else {
                console.error("Role not found in response:", details.data);
                setMsg("Error: Role information not found");
                return;
            }

            let user = {
                'username': username,
                'role': role
            }
            setUserDetails(dispatch)(user);

            switch (role) {
                case "LEARNER":
                    navigate("/learner")
                    break;
                case "AUTHOR":
                    navigate("/author")
                    break;
                case "EXECUTIVE":
                    console.log("EXECUTIVE DASHBOARD");
                    navigate("/executive") // Added navigation for executive
                    break;
                default:
                    setMsg("SOMETHING WENT WRONG: Unknown role " + role);
                    return;
            }

            setMsg("Login Successful");

        } catch (error) {
            console.log("Login error:", error);
            if (error.response) {
                // Server responded with error status
                console.log("Error response:", error.response.data);
                setMsg("Login failed: " + (error.response.data.message || "Server error"));
            } else if (error.request) {
                // Network error
                setMsg("Network error: Please check your connection");
            } else {
                // Other error
                setMsg("Invalid Credentials");
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
                                <div className={`alert ${msg.includes("Successful") ? "alert-success" : "alert-info"}`}>
                                    {msg}
                                </div>
                            </div> : ""}
                            <div className='mb-2'>
                                <label htmlFor="">Enter Username: </label>
                                <input
                                    className='form-control'
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className='mb-2'>
                                <label htmlFor="">Enter Password: </label>
                                <input
                                    className='form-control'
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className='mb-3'>
                                <button
                                    onClick={() => login()}
                                    className='btn btn-primary'
                                    disabled={!username || !password}
                                >
                                    Login
                                </button>
                            </div>
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