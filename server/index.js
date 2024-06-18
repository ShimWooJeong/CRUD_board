const express = require('express'); // Express 모듈 불러옴
const cors = require('cors'); // CORS 모듈 불러옴
const app = express(); //Express 애플리케이션 인스턴스 생성
const PORT = 4000; // 서버가 실행될 포트 설정

// 미들웨어?: 요청과 응답 사이에서 실행되는 함수로, 주로 요청 데이터를 처리하거나 응답을 변환하는데 사용

/*----------미들웨어 설정----------*/
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱
app.use(express.json()); // JSON 데이터 파싱
app.use(cors()); // CORS 활성화

//사용자 목록 & 스레드 목록을 저장할 배열 초기화
const users = [];
const threadList = [];

// 고유 ID 생성
const generateID = () => Math.random().toString(36).substring(2, 10);

// 로그인 API 엔드포인트 = 로그인 라우트
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    //사용자 목록에서 이메일과 비밀번호가 일치하는 사용자가 있는지 확인
    let result = users.filter((user) => user.email === email && user.password === password);

    //일치하는 사용자가 없는 경우 에러 메시지 반환
    if (result.length !== 1) {
        return res.json({
            error_message: 'Incorrect credentials',
        });
    }

    //일치하는 사용자가 있는 경우 로그인 성공 메시지와 사용자 ID 반환
    res.json({
        message: 'Login successfully',
        id: result[0].id,
    });
});

//회원가입 API 엔드포인트 = 라우트
app.post('/api/register', async (req, res) => {
    const { email, password, username } = req.body;
    const id = generateID();
    //사용자 목록에서 이미 존재하는 사용자인지 확인
    const result = users.filter((user) => user.email === email && user.password === password);

    //사용자가 존재하지 않는 경우 새 사용자 생성 후 사용자 목록에 추가
    if (result.length === 0) {
        const newUser = { id, email, password, username };

        users.push(newUser);
        return res.json({
            message: 'Account created successfully!',
        });
    } else {
        //이미 존재하는 사용자인 경우 에러 메시지 반환
        res.json({
            error_message: 'User already exists',
        });
    }
});

// 스레드 생성 API 엔드포인트 = 라우트
app.post('/api/create/thread', async (req, res) => {
    const { thread, userId } = req.body;
    let threadId = generateID();
    //새 스레드 생성 후 스레드 목록의 맨 앞에 추가
    threadList.unshift({
        id: threadId,
        title: thread,
        userId,
        replies: [],
        likes: [],
    });

    //성공 메시지와 현재 스레드 목록 반환
    res.json({
        message: 'Thread created successfully!',
        threads: threadList,
    });
});

//모든 스레드를 가져오는 API 엔드포인트 = 라우트
app.get('/api/all/threads', (req, res) => {
    // 스레드 목록을 JSON 형식으로 반환
    res.json({
        threads: threadList,
    });
});

// 스레드에 좋아요 추가 API 엔드포인트 = 라우트
app.post('/api/thread/like', (req, res) => {
    const { threadId, userId } = req.body;
    // 스레드 ID에 해당하는 스레드 찾음
    const result = threadList.filter((thread) => thread.id === threadId);
    const threadLikes = result[0].likes;

    // 이미 좋아요를 눌렀는지 확인
    const authenticateReaction = threadLikes.filter((user) => user === userId);

    //좋아요를 누르지 않은 경우 좋아요 추가
    if (authenticateReaction.length === 0) {
        threadLikes.push(userId);
        return res.json({
            message: "You've reacted to the post!",
        });
    } else {
        // 이미 좋아요를 누른 경우 에러 메시지 반환
        res.json({
            error_message: 'You can only react once!',
        });
    }
});

// 특정 스레드의 댓글 목록을 가져오는 API 엔드포인트 = 라우트
app.post('/api/thread/replies', (req, res) => {
    const { id } = req.body;
    // 스레드 ID에 해당하는 스레드 찾음
    const result = threadList.filter((thread) => thread.id === id);

    //스레드의 제목과 댓글 목록 반환
    res.json({
        replies: result[0].replies,
        title: result[0].title,
    });
});

// 스레드에 답변을 추가하는 API 엔드포인트 = 라우트
app.post('/api/create/reply', async (req, res) => {
    const { id, userId, reply } = req.body;
    //스레드 ID에 해당하는 스레드 찾음
    const result = threadList.filter((thread) => thread.id === id);
    //사용자 ID에 해당하는 사용자의 이름 찾음
    const username = users.filter((user) => user.id === userId);
    //스레드에 댓글 추가
    result[0].replies.unshift({ name: username[0].username, text: reply });

    //성공 메시지 반환
    res.json({
        message: 'Response added successfully!',
    });
});

//서버를 지정된 포트에서 실행/시작해 지정된 포트에서 클라이언트의 요청을 대기
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
