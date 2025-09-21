import Joi from 'joi';

export const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('student', 'lecturer').required(),
    studentId: Joi.when('role', { is: 'student', then: Joi.string().required(), otherwise: Joi.forbidden() }),
    lecturerId: Joi.when('role', { is: 'lecturer', then: Joi.string().required(), otherwise: Joi.forbidden() }),
    department: Joi.string().required(),
    specialization: Joi.when('role', { is: 'lecturer', then: Joi.string().required(), otherwise: Joi.forbidden() })

  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};


export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

export const validateForgotPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

export const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
