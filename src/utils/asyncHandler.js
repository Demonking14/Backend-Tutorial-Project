const asyncHandler = (requestHandler) => {
    return (req , res , next) => {
        Promise.resolve(requestHandler(req , res , next)).catch((error) => next(error))
    }
}

export default asyncHandler;
/* Same thing as above making a wrapper for handing request  but in below we used async await methond where as in above we ussed promise we can find both type of code in code bases 
const asyncHandler  = async () => {
    try {
        
    } catch (error) {
        error.status(error.code).json({
            message : error.message,
            success : false

        })
        
    }
}
    */