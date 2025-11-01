const xlsx = require("xlsx");
const Income = require("../models/Income");
const path = require('path');
const fs = require('fs');

exports.addIncome = async (req, res) => {
    const userId = req.user.id;

    try{
        const {icon, source, amount, date} = req.body;

        if(!source || !amount || !date){
            return res.status(400).json({message: "All fields are required"});
        }

        const newIncome = new Income({
            userId, icon, source, amount, date:new Date(date)
        });

        await newIncome.save();
        res.status(200).json(newIncome);
    }
    catch(err){
        res.status(500).json({message: "Server Error"});
    }
}

exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try{
        const income = await Income.find({userId}).sort({date:-1});
        res.json(income);
    }
    catch(err){
        res.status(500).json({message: "Server Error"});
    }
}

exports.deleteIncome = async (req, res) => {
    try{
        await Income.findByIdAndDelete(req.params.id);
        res.json({message: "Income deleted successfully"});
    }
    catch(err){
        res.status(500).jsom({message: "Server Error"});
    }
}

exports.downloadIncomeExcel = async (req, res) => {
  try {
    const userId = req.user._id;
    const income = await Income.find({ userId }).sort({ date: -1 });

    const data = income.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: item.date,
    }));

    if (!data.length) {
      return res.status(404).json({ message: "No income records found" });
    }

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Income");

    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const filePath = path.join(tempDir, "income_details.xlsx");

    xlsx.writeFile(wb, filePath);

    const fileName = "income_details.xlsx";

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("end", () => {
      console.log("✅ File sent successfully");
      fs.unlinkSync(filePath); // delete after sending
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

