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

router.get("/prs-for-review", async (req, res) => {
    const user = req.user;
  
    if (!user || !user.accessToken || !user.username) {
      return res.status(400).json({ message: "Unauthorised" });
    }
  
    try {
      const query = `is:pr+review-requested:${user.username}+state:open`; //main query which fetches all the raised pr to account
  
      const response = await axios.get(
        `https://api.github.com/search/issues?q=${query}`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
  
      const pullRequests = response.data.items.map((pr) => {
        const [repoOwner, repoName] = pr.repository_url
          .replace("https://api.github.com/repos/", "")
          .split("/");
  
        return {
          title: pr.title,
          number: pr.number,
          repoOwner,
          repoName,
          url: pr.html_url,
          state: pr.state,
          created_at: pr.created_at,
        };
      });
  
      res.json(pullRequests);
    } catch (err) {
      console.error(
        "Github reviewer PR fetch Failed",
        err?.response?.data || err.message
      );
      res.status(500).json({ message: "Failed to fetch PRs" });
    }
  });

module.exports = router;