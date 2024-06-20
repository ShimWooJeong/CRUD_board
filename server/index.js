const express = require('express'); // Express 모듈 불러옴
const cors = require('cors'); // CORS 모듈 불러옴
const app = express(); //Express 애플리케이션 인스턴스 생성
const PORT = 4000; // 서버가 실행될 포트 설정

// 미들웨어?: 요청과 응답 사이에서 실행되는 함수로, 주로 요청 데이터를 처리하거나 응답을 변환하는데 사용

/*----------미들웨어 설정----------*/
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱
app.use(express.json()); // JSON 데이터 파싱
app.use(cors()); // CORS 활성화

// mongoose 모듈 불러오기
const mongoose = require('mongoose'); //라이브러리 자체를 객체로 만들어서 가져옴

// mongoDB 연결
mongoose
    .connect('mongodb://127.0.0.1:27017')
    .then(() => console.log('mongoDB connected!')) // mongoDB 연결 성공 시
    .catch((e) => console.error(e)); // mongoDB 연결 실패 시

/*---- mongoose의 schema 기능으로 데이터 형식 정의 ----*/
// 스키마 정의
const { Schema } = mongoose;

// user 스키마 구조 생성
const UserSchema = new Schema({
    email: String,
    password: String,
    username: String,
});

// thread 스키마 구조 생성
const ThreadSchema = new Schema({
    title: String,
    contents: String,
    userId: String,
    username: String,
    replies: [
        {
            name: String,
            text: String,
        },
    ],
    likes: [String],
    // value를 넣어주지 않아도, default로 현재 시간을 넣어줌
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
/*----------------------------------------------*/

// 모델 생성, User라는 이름으로 UserSchema를 갖게되는 모델
const User = mongoose.model('User', UserSchema);
const Thread = mongoose.model('Thread', ThreadSchema);

// 로그인 API 엔드포인트 = 로그인 라우트
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    // MongoDB에서 사용자 찾기
    const user = await User.findOne({ email, password });

    //일치하는 사용자가 없는 경우 에러 메시지 반환
    if (!user) {
        return res.json({
            error_message: 'Incorrect credentials',
        });
    }

    //일치하는 사용자가 있는 경우 로그인 성공 메시지와 사용자 ID 반환
    res.json({
        message: 'Login successfully',
        id: user._id,
    });
});

//회원가입 API 엔드포인트 = 라우트
app.post('/api/register', async (req, res) => {
    const { email, password, username } = req.body;

    //사용자 목록에서 이미 존재하는 사용자인지 확인
    const existingUser = await User.findOne({ email });

    //사용자가 존재하지 않는 경우 새 사용자 생성 후 MongoDB에 저장
    if (!existingUser) {
        const newUser = new User({ email, password, username });

        await newUser.save(); // MongoDB에 사용자 저장
        return res.json({
            message: 'Account created successful!',
        });
    } else {
        //이미 존재하는 사용자인 경우 에러 메시지 반환
        res.json({
            error_message: 'User already exists',
        });
    }
});

// 게시글 생성 API 엔드포인트 = 라우트
app.post('/api/create/board', async (req, res) => {
    const { userId, title, contents } = req.body;

    const user = await User.findById(userId);
    const username = user ? user.username : 'Unknown';

    // 새 스레드 생성 후 MongoDB에 저장
    const newThread = new Thread({
        title: title,
        contents: contents,
        userId,
        username,
        replies: [],
        likes: [],
    });

    await newThread.save(); // MongoDB에 새 스레드 저장

    // 모든 스레드 목록 반환
    const threads = await Thread.find().sort({ createdAt: -1 });

    //성공 메시지와 현재 스레드 목록 반환
    res.json({
        message: 'Thread created successfully!',
        threads,
    });
});

//모든 스레드를 가져오는 API 엔드포인트 = 라우트
app.get('/api/all/threads', async (req, res) => {
    // MongoDB에서 모든 스레드를 최신 순으로 가져오기
    const threads = await Thread.find().sort({ createdAt: -1 });

    // 스레드 목록을 JSON 형식으로 반환
    res.json({
        threads,
    });
});

// 좋아요 추가 및 취소 API 엔드포인트 = 라우트
app.post('/api/thread/like', async (req, res) => {
    const { threadId, userId } = req.body;

    try {
        // 스레드 ID에 해당하는 스레드 찾음
        const thread = await Thread.findById(threadId);

        // 이미 좋아요를 눌렀는지 확인
        const authenticateReaction = thread.likes.includes(userId);

        if (!authenticateReaction) {
            //좋아요를 누르지 않은 경우 좋아요 추가
            thread.likes.push(userId);
            await thread.save();
            return res.json({
                message: '좋아요',
                likes: thread.likes.length,
            });
        } else {
            // 이미 좋아요를 누른 경우 좋아요 취소
            thread.likes = thread.likes.filter((id) => id !== userId);
            await thread.save();
            return res.json({
                message: '좋아요 취소',
                likes: thread.likes.length,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 특정 스레드의 댓글 목록을 가져오는 API 엔드포인트 = 라우트
app.post('/api/thread/replies', async (req, res) => {
    const { id } = req.body;

    // 스레드 ID에 해당하는 스레드 찾음
    const thread = await Thread.findById(id);

    //스레드의 제목과 댓글 목록 반환
    res.json({
        replies: thread.replies,
        title: thread.title,
    });
});

// 스레드에 답변을 추가하는 API 엔드포인트 = 라우트
app.post('/api/create/reply', async (req, res) => {
    const { id, userId, reply } = req.body;

    //스레드 ID에 해당하는 스레드 찾음
    const thread = await Thread.findById(id);

    //사용자 ID에 해당하는 사용자의 이름 찾음
    const user = await User.findById(userId);

    //스레드에 댓글 추가
    thread.replies.unshift({ name: user.username, text: reply });

    await thread.save(); // MongoDB에 스레드 저장

    //성공 메시지 반환
    res.json({
        message: '댓글을 달았습니다.',
        replies: thread.replies,
    });
});

// 서버를 지정된 포트에서 실행/시작해 지정된 포트에서 클라이언트의 요청을 대기
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

// 특정 스레드를 가져오는 API 엔드포인트 = 라우트
app.get('/api/thread/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // MongoDB에서 스레드를 ID로 찾기
        const thread = await Thread.findById(id);

        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        // 스레드 정보를 JSON 형식으로 반환
        res.json({ thread });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 특정 스레드를 삭제하는 API 엔드포인트 = 라우트
app.delete('/api/thread/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query; // 클라이언트로부터 userId를 받아옴

    try {
        const thread = await Thread.findById(id);

        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        if (thread.userId !== userId) {
            return res.status(403).json({ message: '본인이 작성한 글만 삭제할 수 있습니다.' });
        }

        await Thread.findByIdAndDelete(id);
        res.json({ message: '게시글이 삭제되었습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 특정 스레드를 수정하는 API 엔드포인트 = 라우트
app.put('/api/thread/:id', async (req, res) => {
    const { id } = req.params;
    const { title, contents, userId } = req.body;

    try {
        const thread = await Thread.findById(id);

        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        if (thread.userId !== userId) {
            return res.status(403).json({ message: '본인이 작성한 글만 수정할 수 있습니다.' });
        }

        thread.title = title;
        thread.contents = contents;
        await thread.save();

        res.json({ message: '게시글이 수정되었습니다.', thread });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
