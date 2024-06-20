import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from './Nav';
import Modal from './Modal';
import Replies from './Replies';
import './../ThreadDetail.css'; // CSS 파일 추가

const ThreadDetail = () => {
    const { id } = useParams();
    const [thread, setThread] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [contents, setContents] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:4000/api/thread/${id}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setThread(data.thread);
                setTitle(data.thread.title);
                setContents(data.thread.contents);
            })
            .catch((err) => console.error(err));
    }, [id]);

    const handleDelete = () => {
        fetch(`http://localhost:4000/api/thread/${id}?userId=${localStorage.getItem('_id')}`, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message === '게시글이 삭제되었습니다.') {
                    navigate('/dashboard');
                } else {
                    alert('본인이 작성한 게시글만 삭제할 수 있습니다.');
                }
            })
            .catch((err) => console.error(err));
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        fetch(`http://localhost:4000/api/thread/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, contents, userId: localStorage.getItem('_id') }), // userId를 함께 전송
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message === '게시글이 수정되었습니다.') {
                    setThread(data.thread);
                    setIsEditing(false);
                } else {
                    alert('본인이 작성한 게시글만 수정할 수 있습니다.');
                }
            })
            .catch((err) => console.error(err));
    };

    if (!thread) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Nav />
            <main className="thread-detail">
                <div className="thread-detail__container">
                    <div className="thread-detail__wrapper">
                        <h2 className="thread-detail__title">{thread.title}</h2>
                        <p className="thread-detail__contents">{thread.contents}</p>
                    </div>
                    <div className="thread-detail__author">작성자: {thread.username}</div>
                </div>
            </main>
            <div className="buttonContainer">
                <button type="button" className="modalBtn" onClick={() => navigate('/dashboard')}>
                    BACK
                </button>
                <button type="button" className="modalBtn" onClick={handleEdit}>
                    EDIT
                </button>
                <button type="button" className="modalBtn" onClick={handleDelete}>
                    DELETE
                </button>
            </div>
            <Replies />
            <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
                <h2>Edit Thread</h2>
                <input
                    type="text"
                    className="modal-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    className="modal-textarea"
                    value={contents}
                    onChange={(e) => setContents(e.target.value)}
                />
                <div className="buttonContainer">
                    <button type="button" className="modalBtn" onClick={handleSave}>
                        SAVE
                    </button>
                    <button type="button" className="modalBtn" onClick={() => setIsEditing(false)}>
                        CANCEL
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default ThreadDetail;
