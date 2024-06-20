import React, { useEffect, useState } from 'react';
import Likes from '../utils/Likes';
import Comments from '../utils/Comments';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';

const Home = () => {
    const [thread, setThread] = useState('');
    const [threadList, setThreadList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = () => {
            if (!localStorage.getItem('_id')) {
                navigate('/');
            } else {
                fetch('http://localhost:4000/api/all/threads')
                    .then((res) => res.json())
                    .then((data) => setThreadList(data.threads))
                    .catch((err) => console.error(err));
            }
        };
        checkUser();
    }, [navigate]);

    const createThread = () => {
        fetch('http://localhost:4000/api/create/thread', {
            method: 'POST',
            body: JSON.stringify({
                thread,
                userId: localStorage.getItem('_id'),
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                alert(data.message);
                setThreadList(data.threads);
            })
            .catch((err) => console.error(err));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createThread();
        setThread('');
    };

    const handleThreadClick = (threadId) => {
        navigate(`/thread/${threadId}`);
    };

    const handleLike = (threadId) => {
        fetch('http://localhost:4000/api/thread/like', {
            method: 'POST',
            body: JSON.stringify({
                threadId,
                userId: localStorage.getItem('_id'),
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error_message) {
                    alert(data.error_message);
                } else {
                    setThreadList((prev) =>
                        prev.map((thread) =>
                            thread._id === threadId ? { ...thread, likes: data.likes } : thread
                        )
                    );
                    window.location.reload();
                }
            })
            .catch((err) => console.error(err));
    };

    const handleReply = (threadId, reply) => {
        fetch('http://localhost:4000/api/create/reply', {
            method: 'POST',
            body: JSON.stringify({
                id: threadId,
                userId: localStorage.getItem('_id'),
                reply,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                alert(data.message);
                setThreadList((prev) =>
                    prev.map((thread) =>
                        thread._id === threadId ? { ...thread, replies: data.replies } : thread
                    )
                );
            })
            .catch((err) => console.error(err));
    };

    const goCreate = () => {
        navigate('/create/board');
    };

    // MongoDB 연동하면서, 자동으로 생성되는 고유 id가 있기 때문에 -> thread._id로 수정
    return (
        <>
            <Nav />
            <main className="home">
                <h1 className="homeTitle">- Board List -</h1>
                <form className="homeForm" onSubmit={goCreate}>
                    <button className="homeBtn">CREATE THREAD</button>
                </form>

                <div className="thread__container">
                    {threadList.map((thread) => (
                        <div
                            className="thread__item"
                            key={thread._id}
                            onClick={() => handleThreadClick(thread._id)}
                        >
                            <p>{thread.title}</p>
                            <div className="react__container">
                                <Likes
                                    numberOfLikes={thread.likes.length}
                                    threadId={thread._id}
                                    handleLike={handleLike}
                                />
                                <Comments
                                    numberOfComments={thread.replies.length}
                                    threadId={thread._id}
                                    title={thread.title}
                                    handleReply={handleReply}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
};

export default Home;
