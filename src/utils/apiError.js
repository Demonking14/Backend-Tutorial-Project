class ApiError extends Error {
    constructor(
        statuscode,
        message ="",
        errors =[],
        stack,

    ){
        super(message),
        this.statuscode = statuscode;
        this.message = message,
        this.data = null,
        this.errors = errors
        this.success = false;
        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}