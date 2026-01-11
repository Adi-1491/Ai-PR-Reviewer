const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/fetch-pr", async (req, res) => {
  const { repo, prNumber } = req.body;
  const user = req.user;

  console.log('🔍 Fetch PR Request:', { repo, prNumber, hasUser: !!user });

  if (!user || !user.accessToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const [owner, repoName] = repo.split("/");

  if (!owner || !repoName) {
    return res.status(400).json({ message: "Invalid repo format. Use: owner/repo" });
  }

  try {
    const url = `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}/files`;
    console.log('📡 GitHub URL:', url);

    // ✅ FIX 1: Use parentheses, not backticks
    // ✅ FIX 2: Use "token" not "Bearer"
    const filesRes = await axios.get(
      url,
      {
        headers: {
          Authorization: `token ${user.accessToken}`,  // ✅ Changed from Bearer to token
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AI-PR-Reviewer"  // ✅ Added required header
        },
      }
    );

    console.log('✅ Success! Got', filesRes.data.length, 'files');

    const files = filesRes.data.map((file) => ({
      filename: file.filename,
      patch: file.patch || "No changes",
      additions: file.additions,
      deletions: file.deletions,
      status: file.status
    }));

    res.json({ files });

  } catch (err) {
    console.error('❌ Fetch PR Error:', err.response?.status, err.response?.data?.message || err.message);

    if (err.response?.status === 404) {
      return res.status(404).json({ 
        message: `PR not found: ${repo} #${prNumber}` 
      });
    }

    if (err.response?.status === 401 || err.response?.status === 403) {
      return res.status(401).json({ 
        message: "GitHub authentication failed" 
      });
    }

    res.status(500).json({ 
      message: "Failed to fetch PR",
      details: err.response?.data?.message || err.message
    });
  }
});

router.get("/prs-for-review", async (req, res) => {
  const user = req.user;

  console.log('🔍 Fetch PRs for:', user?.username);

  if (!user || !user.accessToken || !user.username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const query = `is:pr+review-requested:${user.username}+state:open`;
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}`;
    
    console.log('📡 GitHub Search:', url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${user.accessToken}`,  // ✅ Changed from Bearer to token
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AI-PR-Reviewer"  // ✅ Added required header
      },
    });

    console.log('✅ Found', response.data.items?.length || 0, 'PRs');

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
      "❌ GitHub PR fetch failed:",
      err.response?.status,
      err.response?.data || err.message
    );
    res.status(500).json({ 
      message: "Failed to fetch PRs",
      details: err.response?.data?.message || err.message
    });
  }
});

module.exports = router;