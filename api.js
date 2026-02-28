const API_BASE_URL = 'http://localhost:5000/api';

const showProgress = () => document.getElementById('global-progress')?.classList.remove('hidden');
const hideProgress = () => document.getElementById('global-progress')?.classList.add('hidden');

const API = {
    async call(endpoint, options = {}) {
        showProgress();
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `API Error: ${res.status}`);
            }
            return await res.json();
        } catch (err) {
            console.error(`API Call Failed [${endpoint}]:`, err);
            Toast.error(err.message || 'Connection failed');
            throw err;
        } finally {
            hideProgress();
        }
    },

    async getUser() { return this.call('/user'); },
    async updateUser(data) {
        return this.call('/user', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },
    async getSubjects() { return this.call('/subjects'); },
    async addSubject(data) {
        return this.call('/subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },
    async deleteSubject(id) { return this.call(`/subjects/${id}`, { method: 'DELETE' }); },
    async getTasks() { return this.call('/tasks'); },
    async addTask(data) {
        return this.call('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },
    async toggleTask(id) { return this.call(`/tasks/${id}/toggle`, { method: 'PATCH' }); },
    async deleteTask(id) { return this.call(`/tasks/${id}`, { method: 'DELETE' }); },
    async getPlanner() { return this.call('/planner'); },
    async addPlannerSession(day, data) {
        return this.call(`/planner/${day}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },
    async deletePlannerSession(day, index) { return this.call(`/planner/${day}/${index}`, { method: 'DELETE' }); },
    async getChat() { return this.call('/chat'); },
    async saveChatMessage(data) {
        return this.call('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },
    async clearChat() { return this.call('/chat', { method: 'DELETE' }); },
    async getSyllabus() { return this.call('/syllabus'); },
    async saveSyllabusBulk(topics) {
        return this.call('/syllabus/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(topics)
        });
    },
    async clearSyllabus() { return this.call('/syllabus', { method: 'DELETE' }); },
    async getTestHistory() { return this.call('/test-history'); },
    async saveTestResult(data) {
        return this.call('/test-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
};
