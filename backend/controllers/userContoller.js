export const getUser = async (req, res) => {
    try {
        const { userId } = req.body.user;

          const userExist = await Pool.query({
            text: `SELECT * FROM tbluser WHERE id = $1`,
            values: [userId],
          });
    } catch (error) {
        console.log(error);
        res.status(500).res.json({ status: "Failed", message: error.message});
    }
};

export const changePassword = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
        res.status(500).res.json({ status: "Failed", message: error.message});
    }
}
export const updateUser = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
        res.status(500).res.json({ status: "Failed", message: error.message});
    }
}