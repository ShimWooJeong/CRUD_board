import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'; // 모듈 불러오기
import Register from './components/Register'; // Register 컴포넌트 불러오기
import Login from './components/Login'; // Login 컴포넌트 불러오기
import Home from './components/Home'; // Home 컴포넌트 불러오기
import Replies from './components/Replies'; // Replies 컴포넌트 불러오기

const App = () => {
    return (
        <div>
            {/* BrowserRouter: 애플리케이션에 HTML5 히스토리 기능 제공 */}
            <BrowserRouter>
                {/* Routes는 여러 Route를 그룹화해 라우팅 관리 */}
                <Routes>
                    {/* path="/" URL 경로에 Login 컴포넌트 렌더링 */}
                    <Route path="/" element={<Login />} />
                    {/* path="/register" URL 경로에 Register 컴포넌트 렌더링 */}
                    <Route path="/register" element={<Register />} />
                    {/* path="/dashboard" URL 경로에 Home 컴포넌트 렌더링 */}
                    <Route path="/dashboard" element={<Home />} />
                    {/* path="/:id/replies" URL 경로에 Replies 컴포넌트 렌더링 */}
                    <Route path="/:id/replies" element={<Replies />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;
