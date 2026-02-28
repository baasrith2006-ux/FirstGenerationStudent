const Joi = require('joi');

// 1. User Schema
const userSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    initials: Joi.string().max(5),
    stream: Joi.string().max(50),
    year: Joi.string().max(20),
    goal: Joi.string().max(100),
    streak: Joi.number().integer().min(0),
    dnaTraits: Joi.array().items(Joi.string()),
    dnaProfile: Joi.object({
        type: Joi.string(),
        description: Joi.string()
    }),
    usedQuestions: Joi.object()
}).min(1);

// 2. Task Schema
const taskSchema = Joi.object({
    name: Joi.string().required().min(1).max(100),
    subject: Joi.string().max(50),
    duration: Joi.string().max(20),
    completed: Joi.boolean()
});

// 3. Subject Schema
const subjectSchema = Joi.object({
    name: Joi.string().required().min(1).max(50),
    icon: Joi.string().max(10),
    mastery: Joi.number().integer().min(0).max(100)
});

// 4. Planner Schema
const plannerSchema = Joi.object({
    day: Joi.string().required().valid('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'),
    subject: Joi.string().required().max(50),
    time: Joi.string().required().max(50)
});

// 5. Chat Schema
const chatSchema = Joi.object({
    text: Joi.string().required().min(1),
    sender: Joi.string().required().valid('user', 'bot')
});

// 6. Syllabus Schema (Bulk)
const syllabusSchema = Joi.array().items(Joi.object({
    name: Joi.string().required(),
    subject: Joi.string()
}));

// 7. Test History Schema
const testHistorySchema = Joi.object({
    subject: Joi.string().required(),
    score: Joi.number().required().min(0),
    total: Joi.number().required().min(1),
    date: Joi.string().required()
});

module.exports = {
    userSchema,
    taskSchema,
    subjectSchema,
    plannerSchema,
    chatSchema,
    syllabusSchema,
    testHistorySchema
};
