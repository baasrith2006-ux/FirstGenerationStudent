const API_BASE_URL = 'http://localhost:5000/api';

const API = {
    async getUser() {
        const res = await fetch(`${API_BASE_URL}/user`);
        return res.json();
    },
    async updateUser(data) {
        const res = await fetch(`${API_BASE_URL}/user`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async getSubjects() {
        const res = await fetch(`${API_BASE_URL}/subjects`);
        return res.json();
    },
    async addSubject(data) {
        const res = await fetch(`${API_BASE_URL}/subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async deleteSubject(id) {
        const res = await fetch(`${API_BASE_URL}/subjects/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },
    async getTasks() {
        const res = await fetch(`${API_BASE_URL}/tasks`);
        return res.json();
    },
    async addTask(data) {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async toggleTask(id) {
        const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PATCH'
        });
        return res.json();
    },
    async deleteTask(id) {
        const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },
    async getPlanner() {
        const res = await fetch(`${API_BASE_URL}/planner`);
        return res.json();
    },
    async addPlannerSession(day, data) {
        const res = await fetch(`${API_BASE_URL}/planner/${day}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async deletePlannerSession(day, index) {
        const res = await fetch(`${API_BASE_URL}/planner/${day}/${index}`, {
            method: 'DELETE'
        });
        return res.json();
    },
    async getChat() {
        const res = await fetch(`${API_BASE_URL}/chat`);
        return res.json();
    },
    async saveChatMessage(data) {
        const res = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async clearChat() {
        const res = await fetch(`${API_BASE_URL}/chat`, {
            method: 'DELETE'
        });
        return res.json();
    },
    async getSyllabus() {
        const res = await fetch(`${API_BASE_URL}/syllabus`);
        return res.json();
    },
    async saveSyllabusBulk(topics) {
        const res = await fetch(`${API_BASE_URL}/syllabus/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(topics)
        });
        return res.json();
    },
    async clearSyllabus() {
        const res = await fetch(`${API_BASE_URL}/syllabus`, {
            method: 'DELETE'
        });
        return res.json();
    },
    async getTestHistory() {
        const res = await fetch(`${API_BASE_URL}/test-history`);
        return res.json();
    },
    async saveTestResult(data) {
        const res = await fetch(`${API_BASE_URL}/test-history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    }
};
