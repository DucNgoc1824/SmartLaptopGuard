// src/components/Profile.jsx
import React from 'react';
import '../style/Profile.css';

const Profile = () => {
    return (
        <div className="profile-wrapper">
            <div className="profile-card">
                <div className="profile-cover"></div>
                <div className="profile-content">
                    <div className="profile-header-row">
                        <div className="profile-avatar">
                            {/* Bạn có thể thay src bằng ảnh thật của bạn trong thư mục public */}
                            <img src="/vestvip.png" alt="Avatar" />
                        </div>
                        <button className="btn-edit">
                            <i className="fa-solid fa-pen"></i> Edit Profile
                        </button>
                    </div>

                    <div className="profile-info">
                        <h1>
                            Duong Duc Ngoc
                            <i className="fa-solid fa-circle-check verified-icon"></i>
                        </h1>
                        <p>PTIT's MultiMedia Student</p>
                        <div className="tags">
                            <span className="tag">#Arduino</span>
                            <span className="tag">#ESP32</span>
                            <span className="tag">#SmartCoolingStand</span>
                            <span className="tag">#ReactJS</span>
                        </div>
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <h4>Student ID</h4>
                            <p>B22DCPT190</p>
                        </div>
                        <div className="info-item">
                            <h4>Class</h4>
                            <p>D22PTDPT1</p>
                        </div>
                        <div className="info-item">
                            <h4>Project</h4>
                            <p>Smart Cooling Stand System</p>
                        </div>
                        <div className="info-item">
                            <h4>Email</h4>
                            <p>ngocmon1824@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="section-title">Resources & Source Code</div>
                <div className="resource-grid">
                    <a href="#" target='blank' className="resource-card card-pdf">
                        <div className="res-icon"><i className="fa-solid fa-file-pdf"></i></div>
                        <div className="res-content">
                            <h3>Project Report</h3>
                            <p>Download full PDF report</p>
                        </div>
                    </a>
                    <a href="https://github.com/DucNgoc1824/SmartLaptopGuard.git" target="_blank" rel="noreferrer" className="resource-card card-git">
                        <div className="res-icon"><i className="fa-brands fa-github"></i></div>
                        <div className="res-content">
                            <h3>Source Code</h3>
                            <p>Github Repository</p>
                        </div>
                    </a>
                    <a href="https://documenter.getpostman.com/view/53208975/2sBXigMYmn" target='blank' className="resource-card card-api">
                        <div className="res-icon"><i className="fa-solid fa-code"></i></div>
                        <div className="res-content">
                            <h3>API Docs</h3>
                            <p>Swagger / Postman Collection</p>
                        </div>
                    </a>
                    <a href="https://www.figma.com/design/iQo95PisiYfqy754Qrc2lJ/Smart-Cooling-Stand?node-id=0-1&t=J1AyvcXlQYhMzgdf-1" target='blank' className="resource-card card-fig">
                        <div className="res-icon"><i className="fa-brands fa-figma"></i></div>
                        <div className="res-content">
                            <h3>UI Design</h3>
                            <p>Figma Design File</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Profile;