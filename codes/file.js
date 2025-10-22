const axios = require("axios");

const githubToken = ""; //token github lu
const owner = ""; //username github lu
const repo = "fitur"; //biarin 
const branch = "main"; //biarin 

async function ensureRepoExists() {
  try {
    await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${githubToken}` },
    });
  } catch (e) {
    if (e.response?.status === 404) {
      await axios.post(
        `https://api.github.com/user/repos`,
        { name: repo, private: false },
        { headers: { Authorization: `Bearer ${githubToken}` } }
      );
    } else throw e;
  }
}

async function uploadCode(filename, content) {
  await ensureRepoExists();

  const path = `codes/${filename}`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const base64Content = Buffer.from(content, "utf-8").toString("base64");

  // Cek apakah file sudah ada
  let sha = null;
  try {
    const res = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${githubToken}` },
    });
    sha = res.data.sha;
  } catch (_) {}

  const body = {
    message: `Upload or update file ${filename}`,
    content: base64Content,
    branch,
  };
  if (sha) body.sha = sha;

  await axios.put(apiUrl, body, {
    headers: { Authorization: `Bearer ${githubToken}` },
  });

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}