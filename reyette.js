const readline = require("readline");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Pastikan folder download ada
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function download() {
  rl.question("Masukkan format yang ingin kamu unduh [mp3/mp4]: ", (format) => {
    rl.question("Masukkan link YouTube: ", (url) => {
      const outputDir = path.resolve("./downloads", format === "mp3" ? "audio" : "video");
      ensureDir(outputDir);

      // Command yt-dlp
      const cmd =
        format === "mp3"
          ? `yt-dlp -x --audio-format mp3 -o "${outputDir}/%(title)s.%(ext)s" "${url}"`
          : `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "${outputDir}/%(title)s.%(ext)s" "${url}"`;

      console.log("⏳ Sedang mengunduh, tunggu sebentar...");

      const process = exec(cmd);

      process.stdout.on("data", (data) => {
        console.log(data.toString());
      });

      process.stderr.on("data", (data) => {
        console.error(data.toString());
      });

      process.on("close", (code) => {
        if (code === 0) {
          console.log(`✅ Selesai diunduh! File ada di: ${outputDir}`);
        } else {
          console.log("❌ Terjadi kesalahan saat mengunduh.");
        }
        rl.close();
      });
    });
  });
}

download();