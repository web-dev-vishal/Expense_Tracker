import { pool } from "../libs/database.js";

export const getUser = async (req, res) => {
    try {
        const { userId } = req.body.user;

        const userExist = await pool.query({
            text: `SELECT * FROM tbluser WHERE id = $1`,
            values: [userId],
        });

        const user = userExist.rows[0]

        if (!user) { return res.status(404).json({ status: "Failed", message: "User not Found" }) }

        user.password = undefined;

        res.status(201).json({ status: "Success", user })
    } catch (error) {
        console.log(error);
        res.status(500).res.json({ status: "Failed", message: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        res.status(500).res.json({ status: "Failed", message: error.message });
    }
}
export const updateUser = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        res.status(500).res.json({ status: "Failed", message: error.message });
    }
}