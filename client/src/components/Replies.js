import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Replies 컴포넌트 정의
const Replies = () => {
    // useState 훅을 사용해 replyList, reply, title 관리
    const [replyList, setReplyList] = useState([]);
    const [reply, setReply] = useState('');
    const [title, setTitle] = useState('');

    // useNavigate 훅을 사용해 페이지 이동 처리
    const navigate = useNavigate();

    // useParams 훅을 사용해 URL 파라미터 가져옴
    const { id } = useParams();

    // 새로운 댓글 추가하는 함수
    const addReply = () => {
        // fetch를 사용해 서버에 POST 요청을 보내고, 새로운 답변 추가
        fetch('http://localhost:4000/api/create/reply', {
            method: 'POST',
            // 요청 본문에 id, userId, reply 포함
            body: JSON.stringify({
                id,
                userId: localStorage.getItem('_id'), // 로컬 스토리지에서 userId 가져옴
                reply,
            }),
            // 요청 헤더에 Content-Type을 JSON으로 설정
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json()) // 응답을 JSON 형식으로 변환
            .then((data) => {
                alert(data.message); // 성공 메시지 알림
                navigate('/dashboard'); // dashboard 페이지로 이동
            })
            .catch((err) => console.error(err)); // 에러 발생 시 콘솔에 에러 출력
    };

    // 댓글 폼 제출 시 호출되는 함수
    const handleSubmitReply = (e) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지
        addReply(); // 답변 추가 함수 호출
        setReply(''); // reply 상태 초기화
    };

    // 컴포넌트가 마운트될 때와 id가 변경될 때 호출되는 useEffect 훅
    useEffect(() => {
        // 스레드의 댓글들을 가져오는 함수
        const fetchReplies = () => {
            // 서버에 POST 요청을 보내 해당 스레드의 댓글 목록과 제목을 가져옴
            fetch('http://localhost:4000/api/thread/replies', {
                method: 'POST',
                // 요청 본문에 id 포함
                body: JSON.stringify({
                    id,
                }),
                // 요청 헤더에 Content-Type을 JSON으로 설정
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.json()) // 응답을 JSON 형식으로 변환
                .then((data) => {
                    // 가져온 데이터를 replyList와 title 상태에 저장
                    setReplyList(data.replies);
                    setTitle(data.title);
                })
                .catch((err) => console.error(err)); // 에러 발생 시 콘솔에 에러 출력
        };
        fetchReplies(); // 스레드의 댓글을 가져오는 함수 호출
    }, [id]); // id가 변경될 때마다 useEffect 훅 실행

    // 컴포넌트 렌더링
    return (
        <main className="replies">
            <h1 className="repliesTitle">{title}</h1>

            <form className="modal__content" onSubmit={handleSubmitReply}>
                <label htmlFor="reply">Reply to the thread</label>
                <textarea
                    rows={5}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)} // reply 입력 값 변경 시 상태 업데이트
                    type="text"
                    name="reply"
                    className="modalInput"
                />

                <button className="modalBtn">SEND</button>
            </form>

            <div className="thread__container">
                {replyList.map((reply) => (
                    <div className="thread__item">
                        <p>{reply.text}</p>
                        <div className="react__container">
                            <p style={{ opacity: '0.5' }}>by {reply.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default Replies;
