const path = require('path');
const fs = require("fs");

const xlsx = require("xlsx");
const Expense = require("../models/Expense");

exports.addExpense = async (req, res) => {
    const userId = req.user.id;

    try{
        const {icon, category, amount, date} = req.body;

        if(!category || !amount || !date){
            return res.status(400).json({message: "All fields are required"});
        }

        const newExpense = new Expense({
            userId, icon, category, amount, date:new Date(date)
        });

        await newExpense.save();
        res.status(200).json(newExpense);
    }
    catch(err){
        res.status(500).json({message: "Server Error"});
    }
}

exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;

    try{
        const expense = await Expense.find({userId}).sort({date:-1});
        res.json(expense);
    }
    catch(err){
        res.status(500).json({message: "Server Error"});
    }
}

exports.deleteExpense = async (req, res) => {
    try{
        await Expense.findByIdAndDelete(req.params.id);
        res.json({message: "Expense deleted successfully"});
    }
    catch(err){
        res.status(500).jsom({message: "Server Error"});
    }
}

exports.downloadExpenseExcel = async (req, res) => {
  try {
    const userId = req.user._id;
    const expense = await Expense.find({userId}).sort({date:-1});
    const data = expense.map((item) => ({
        Category: item.category,
        Amount: item.amount,
        Date: item.date,
    }));

    if (!data.length) {
      return res.status(404).json({ message: "No expenses found" });
    }

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expenses");

    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const filePath = path.join(tempDir, "expense_details.xlsx");
    xlsx.writeFile(wb, filePath);

    const fileName = "expense_details.xlsx";
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("end", () => {
      console.log("✅ File sent successfully");
      fs.unlinkSync(filePath); // delete file after sending
    });

    fileStream.on("error", (err) => {
      console.error("❌ Stream error:", err);
      res.status(500).send("Error sending the file");
    });
  } catch (err) {
    console.error("Error generating Excel:", err);
    res.status(500).json({ message: "Server error", err });
  }
};
