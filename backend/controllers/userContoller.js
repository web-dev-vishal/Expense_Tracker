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
        const { userId } = req.body.user;

        const { currentPassword, newPassword, confifPassword } = req.body;

        const userExist = await pool.query({
            text: `SELECT * FROM tbluser WHERE id = $1`,
        })

        const user = userExist.rows[0];

        if (!user) { return res.status(404).json({ status: "Failed", message: "User not found" }) };

        if (newPassword !== confifPassword) {
            return res.status(401).json({ status: "failed", message: "New Password does not match" })
        }

        const isMatch = await comparePassword(currentPassword, user?.password);

        if (!isMatch) { return res.status(401).json({ status: "failed", message: "Invalid current password" }) }

        const hashedPassword = await hashedPassword(newPassword)

        await pool.query({
            text: `UPDATE SET password = $1 WHERE id = $2`,
            values: [hashedPassword, userId],
        });

        res.status(200).json({
            status: "success",
            message: "Password changed successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).res.json({ status: "Failed", message: error.message });
    }
}
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { firstname, lastname, country, currency, contact } = req.body;

        const userExist = await pool.query({
            text: `SELECT * FROM tbluser WHERE id = $1`,
            values: [userId],
        });

        const user = userExist.rows[0];

        if (!user) { return res.status(404).json({ status: "failed", message: "User not found❗" })}

        const updatedUser = await pool.query({
            text: `UPDATE tbluser SET firstname = $1, lastname = $2, country = $3, currency = $4, contact = $5, updatedat = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *`,
            values: [firstname, lastname, country, currency, contact, userId],
        });

        updatedUser.rows[0].password = undefined;

        res.status(200).json({
            status: "success",
            message: "User updated successfully ✅",
            user: updatedUser.rows[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).res.json({ status: "Failed", message: error.message });
    }
}


// export const updateUser = async (req, res) => {
//     try {

//     } catch (error) {
//         console.log(error);
//         res.status(500).res.json({ status: "Failed", message: error.message });
//     }
// }