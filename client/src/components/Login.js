import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Login 컴포넌트 정의
const Login = () => {
    // 상태(state) 훅을 사용해 email과 password 관리
    const [email, setEmail] = useState(''); // email 상태와, 이를 업데이트하는 setEmail 함수 정의
    const [password, setPassword] = useState(''); // password 상태와, 이를 업데이트하는 setPassword 함수 정의

    // useNavigate 훅을 사용해 페이지 이동 처리
    const navigate = useNavigate();

    // 로그인 요청을 처리하는 함수
    const loginUser = () => {
        // fetch API를 사용해 로그인 요청 보냄
        fetch('http://localhost:4000/api/login', {
            method: 'POST',
            // 요청 본문에 email과 password를 포함
            body: JSON.stringify({
                email,
                password,
            }),
            // 요청 헤더에 Content-Type을 JSON으로 설정
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json()) // 응답을 JSON 형식으로 반환
            .then((data) => {
                if (data.error_message) {
                    // 로그인 실패 시 에러 메시지
                    alert(data.error_message);
                } else {
                    // 로그인 성공시 메시지 알림
                    alert(data.message);
                    // /dashboard 페이지로 이동
                    navigate('/dashboard');
                    // localStorage에 사용자 ID 저장
                    localStorage.setItem('_id', data.id);
                }
            })
            // 에러 발생 시 console에 에러 출력
            .catch((err) => console.error(err));
    };

    // (로그인)폼 제출 시 호출되는 함수
    const handleSubmit = (e) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지
        loginUser(); // 로그인 함수 호출
        setEmail(''); // email 상태 초기화
        setPassword(''); // password 상태 초기화
    };

    // 컴포넌트 렌더링
    return (
        <main className="login">
            <h1 className="loginTitle">Log into your account</h1>
            <form className="loginForm" onSubmit={handleSubmit}>
                <label htmlFor="email">Email Address</label>
                <input
                    type="text"
                    name="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="loginBtn">SIGN IN</button>
                <p>
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </form>
        </main>
    );
};

export default Login;
