class ApiResponse {
    constructor(
        message  = "Successful", data ,  stautscode
    ){
        this.message = message;
        this.data = data;
        this.stautscode = stautscode 
        this.success = stautscode <500;

    }
}