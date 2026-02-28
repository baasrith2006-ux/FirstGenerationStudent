const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    stream: Joi.string().max(50),
    year: Joi.string().max(20),
    goal: Joi.string().max(100),
    streak: Joi.number().integer().min(0),
    usedQuestions: Joi.object()
}).min(1); // At least one field must be present for update

const taskSchema = Joi.object({
    name: Joi.string().required().min(1).max(100),
    subject: Joi.string().max(50),
    duration: Joi.string().max(20)
});

module.exports = {
    userSchema,
    taskSchema
};
