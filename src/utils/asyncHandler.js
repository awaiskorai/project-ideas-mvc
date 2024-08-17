const asyncHandler = (childFunction) => async (req, res, next) => {
  try {
    await childFunction(req, res, next);
  } catch (e) {
    next(e);
  }
};
const asyncHandlerService =
  (childFunction) =>
  async (arg1, arg2, arg3, ...args) => {
    try {
      return await childFunction(arg1, arg2, arg3, args);
    } catch (e) {
      throw new Error(`Service Crashed ${e}`);
    }
  };
export { asyncHandler, asyncHandlerService };

// const asynHandler = function (childFunction) {
//     return async function (req, res, next) {
//       try {
//         await childFunction(req, res, next);
//       } catch (e) {
//         next(e);
//       }
//     };
//   };
