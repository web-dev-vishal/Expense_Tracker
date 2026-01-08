export const getUser = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
        res.status(500).res.json({ status: "Failed", message: error.message});
    }
};

export const changePassword = async (req, res) => {

}
export const updateUser = async (req, res) => {

}