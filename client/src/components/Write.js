import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from './Nav';

const Write = () => {
    const [title, setTitle] = useState('');
    const [contents, setContent] = useState('');
    const [thread, setThread] = useState('');

    const navigate = useNavigate();

    const { id } = useParams();

    const addBoard = () => {
        fetch('http://localhost:4000/api/create/board', {
            method: 'POST',
            body: JSON.stringify({
                id,
                userId: localStorage.getItem('_id'),
                title,
                contents,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                alert(data.message);
                // setThreadList(data.threads);
            })
            .catch((err) => console.error(err));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addBoard();
        setThread('');
        goBack();
    };

    const goBack = () => {
        navigate('/dashboard');
    };

    return (
        <>
            <Nav />
            <main className="home">
                <h1 className="homeTitle">Create a Board</h1>
                <form className="modal__content" onSubmit={handleSubmit}>
                    <text>Title: </text>
                    <input
                        type="text"
                        name="title"
                        required
                        value={thread.title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <text>Contents: </text>
                    <textarea
                        rows={15}
                        type="text"
                        name="contents"
                        required
                        value={thread.contents}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <div className="buttonContainer">
                        <button className="modalBtn">SEND</button>
                        <button type="button" className="modalBtn" onClick={goBack}>
                            BACK
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
};

export default Write;
