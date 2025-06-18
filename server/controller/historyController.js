const History = require('../models/History');
//save new review
 exports.createHistory = async(req,res) => {
    try {
        const {code, suggestions} = req.body;
        const newHistory = new History({
            code,
            suggestions,
            timestamp: new Date()
        });
        await newHistory.save();
        return res.status(201).json(newHistory);
    }
    catch(error) {
        return res.status(500).json({error: 'Failed to save history'})
    }
};


//fetch all reviews
exports.getHistory = async(req,res) => {
    try{
        const all = await History.find().sort({ timestamp: -1 });
        res.json(all);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch history' });
      }
};

exports.deleteHistory =  async(req,res) => {
    try {
        const{id} = req.params;
        const deleteHistory = await History.findByIdAndDelete(id);

        if(!deleteHistory) {
            return res.status(404).json({ error: "History entry not found" });
        }
        return res.json({ message: "History entry deleted successfully" });
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to delete history" });
    }
};

exports.deleteAllHistory = async(req,res) => {
    try{
        await History.deleteMany({});
        return res.json({ message: "All history entries deleted successfully" });
  } catch (error) {
    console.error("Error deleting all history:", error);
    return res.status(500).json({ error: "Failed to delete all history" });
  }
};