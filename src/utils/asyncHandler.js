const asyncHandler = (childFunction) => async (req, res, next) => {
  try {
    await childFunction(req, res, next);
  } catch (e) {
    next(e);
  }
};

export { asyncHandler };

// const asynHandler = function (childFunction) {
//     return async function (req, res, next) {
//       try {
//         await childFunction(req, res, next);
//       } catch (e) {
//         next(e);
//       }
//     };
//   };
