const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/fetch-pr", async (req,res) => {
    const {repo, prNumber } = req.body;
    const user = req.user;

    if(!user || !user.accessToken) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const [owner, repoName] = repo.split("/");

    try {
        const filesRes = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}/files`,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );

        const files = filesRes.data.map((file) => ({
            filename: file.filename,
            patch: file.patch,
        }));

        res.json({files});
    }
    catch(err) {
        console.log(err.message);
        return res.status(500).json({message:"Failed to fetch PR"});
    }
});

module.exports = router;