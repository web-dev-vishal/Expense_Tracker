export const signinUser = async(req,res)=> {
    try {
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: error.message });
    }
}