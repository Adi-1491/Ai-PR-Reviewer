const History = require('../models/History');
//save new review
 exports.createHistory = async(req,res) => {
    try {
        const {code, suggestions} = req.body;

        if (!req.user || !req.user.username) 
        {
            return res.status(401).json({ error: "Unauthorized: No user info found" });
        }
      
        const newHistory = new History({
            user: req.user.username,
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
        if (!req.user || !req.user.username) 
        {
            return res.status(401).json({ error: "Unauthorized: No user info found" });
        }
        const all = await History.find({ user: req.user.username }).sort({ timestamp: -1 });
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
        if (!req.user || !req.user.username) 
        {
            return res.status(401).json({ error: "Unauthorized: No user info found" });
        }

        await History.deleteMany({user: req.user.username });
        return res.json({ message: "All history entries deleted successfully" });
        
  } catch (error) {
    console.error("Error deleting all history:", error);
    return res.status(500).json({ error: "Failed to delete all history" });
  }
};