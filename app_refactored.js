async function initApp() {
    try {
        // Show skeletons first
        showSkeletons('dashboard-task-list', 4);
        showSkeletons('dna-subjects-grid', 3);

        const [user, subjects, tasks, planner, chats, syllabus, testHistory] = await Promise.all([
            API.getUser(),
            API.getSubjects(),
            API.getTasks(),
            API.getPlanner(),
            API.getChat(),
            API.getSyllabus(),
            API.getTestHistory()
        ]);

        AppState.student = {
            name: user.name || 'Student Name',
            initials: user.initials || 'SN',
            stream: user.stream || 'Not set',
            year: user.year || 'Not set',
            goal: user.goal || 'Not set',
            streak: user.streak || 0,
        };
        AppState.dnaTraits = user.dnaTraits || [];
        AppState.dnaProfile = user.dnaProfile || { type: 'Not yet analyzed', description: 'Complete your profile to see your study DNA.' };
        AppState.subjects = subjects;
        AppState.todayTasks = tasks;
        AppState.planner = planner;
        AppState.chatHistory = chats;
        AppState.extractedSyllabus = syllabus;
        extractedSyllabus = syllabus;
        AppState.testHistory = testHistory;
        AppState.usedQuestions = user.usedQuestions || { math: [], physics: [], cs: [], chemistry: [] };

        // Initial renders
        initNav();
        renderDashboard();
        renderStudyDNA();
        renderPlanner();
        renderChat();
        renderSyllabusPreview();
        renderTestResults();
        updateAnalytics();

        Toast.info('System connected. Welcome back!');
    } catch (err) {
        console.error('Failed to initialize app:', err);
        Toast.error('Failed to connect to backend. Please check your connection.');
    }
}
