const APIResponse = function (status = 200, data, message = "") {
  this.status = status;
  this.data = data;
  this.message = message;
  this.success = status < 400;
};

export { APIResponse };
