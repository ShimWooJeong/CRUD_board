import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './../Replies.css'; // CSS 파일 추가

const Replies = () => {
    const [replyList, setReplyList] = useState([]);
    const [reply, setReply] = useState('');
    const { id } = useParams();

    const addReply = () => {
        fetch('http://localhost:4000/api/create/reply', {
            method: 'POST',
            body: JSON.stringify({
                id,
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
                setReplyList(data.replies);
            })
            .catch((err) => console.error(err));
    };

    const handleSubmitReply = (e) => {
        e.preventDefault();
        addReply();
        setReply('');
    };

    useEffect(() => {
        const fetchReplies = () => {
            fetch('http://localhost:4000/api/thread/replies', {
                method: 'POST',
                body: JSON.stringify({
                    id,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    setReplyList(data.replies);
                })
                .catch((err) => console.error(err));
        };
        fetchReplies();
    }, [id]);

    return (
        <div className="replies">
            <h2 className="repliesTitle">Replies</h2>
            <form className="replyForm" onSubmit={handleSubmitReply}>
                <input
                    value={reply}
                    required
                    onChange={(e) => setReply(e.target.value)}
                    type="text"
                    name="reply"
                    className="replyInput"
                />
                <button type="submit" className="replyBtn">
                    SEND
                </button>
            </form>
            <div className="replyList">
                {replyList.map((reply) => (
                    <div className="replyItem" key={reply._id}>
                        <p>{reply.text}</p>
                        <p className="replyAuthor">by {reply.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Replies;
