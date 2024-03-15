export const validation = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params };
    let validationResult = schema.validate(data, { abortEarly: false });

    if (validationResult.error) {
      const errorMessage = validationResult.error.details.map((obj) => {
        return obj.message;
      });

      return next(new Error(errorMessage, { cause: 400 }));
      // return res.json({ validationResult });
    }

    return next();
  };
};
