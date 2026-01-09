import { pool } from "../libs/database.js";

export const getAccounts = async (req,res)=> {
    try {
        const {userId} = req.body.user;

        const account = await pool.query({
            text: `SELECT * FROM tblaccount WHERE user_id = $1`,
            values: [userId],
        })
        res.status(200).json({ status: 'success', data: account.rows})
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: "Failed", message: error.message})
    }  
};

export const createAccount = async (req,res)=> {
    try {
        const {userId} = req.body.user;
                
        const {name, amount, account_number} = req.body;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ 
                status: "Failed", 
                message: "Please provide a valid amount" 
            });
        }

        const accountBalance = Number(amount);

        const accountExistQuery = {
            text: `SELECT * FROM tblaccount WHERE account_name = $1 AND user_id = $2`,
            values: [name, userId],
        };

        const accountExistResult = await pool.query(accountExistQuery);

        const accountExist = accountExistResult.rows[0];

        if (accountExist){
            return res.status(409).json({ status:"Failed", message: "Account already created"})
        }
        const createAccountResult = await pool.query({
            text: `INSERT INTO tblaccount(user_id, account_name, account_number, account_balance) VALUES($1, $2, $3, $4) RETURNING *`,
            values: [userId, name, account_number, accountBalance],});

        const account = createAccountResult.rows[0];

        const userAccounts = Array.isArray(name) ? name : [name];

        const updateUserAccountQuery = {
           text: `UPDATE tbluser SET accounts = array_cat(accounts, $1), updatedat = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
           values: [userAccounts, userId],
    };
        await pool.query(updateUserAccountQuery);

        const description = account.account_name + " (Initial Deposit)";

    const initialDepositQuery = {
      text: `INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
      values: [
        userId,
        description,
        "income",
        "Completed",
        accountBalance,
        account.account_name,
      ],
    };
    await pool.query(initialDepositQuery);

    res.status(201).json({
      status: "success",
      message: account.account_name + " Account created successfully",
      data: account,
    });
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: "Failed", message: error.message})
    }
};

// export const addMoneyToAccount = async (req, res) => {
//   try {
//     const { userId } = req.body.user;
//     const { id } = req.params;
//     const { amount } = req.body;

//     const newAmount = Number(amount);

//     const result = await pool.query({
//       text: `UPDATE tblaccount SET account_balance =(account_balance + $1), updatedat = CURRENT_TIMESTAMP  WHERE id = $2 RETURNING *`,
//       values: [newAmount, id],
//     });

//     const accountInformation = result.rows[0];

//     const description = accountInformation.account_name + " (Deposit)";

//     const transQuery = {
//       text: `INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
//       values: [
//         userId,
//         description,
//         "income",
//         "Completed",
//         amount,
//         accountInformation.account_name,
//       ],
//     };
//     await pool.query(transQuery);

//     res.status(200).json({
//       status: "success",
//       message: "Operation completed successfully",
//       data: accountInformation,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ status: "failed", message: error.message });
//   }
// };

export const addMoneyToAccount = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ 
        status: "failed", 
        message: "Please provide a valid amount" 
      });
    }

    const newAmount = Number(amount);

    const result = await pool.query({
      text: `UPDATE tblaccount SET account_balance =(account_balance + $1), updatedat = CURRENT_TIMESTAMP  WHERE id = $2 RETURNING *`,
      values: [newAmount, id],
    });

    const accountInformation = result.rows[0];

    if (!accountInformation) {
      return res.status(404).json({
        status: "failed",
        message: "Account not found"
      });
    }

    const description = accountInformation.account_name + " (Deposit)";

    const transQuery = {
      text: `INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
      values: [
        userId,
        description,
        "income",
        "Completed",
        newAmount,
        accountInformation.account_name,
      ],
    };
    await pool.query(transQuery);

    res.status(200).json({
      status: "success",
      message: "Operation completed successfully",
      data: accountInformation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};