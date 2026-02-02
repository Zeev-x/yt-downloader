const readline = require("readline");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 🔍 Cek apakah ffmpeg tersedia
function checkFfmpeg(callback) {
  exec("ffmpeg -version", (error) => {
    if (error) {
      console.error("❌ FFmpeg tidak ditemukan! Pastikan sudah terinstal dan ada di PATH.");
      rl.close();
    } else {
      callback();
    }
  });
}

// Pastikan folder download ada
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function runCommand(cmd, outputDir) {
  console.log("⏳ Sedang mengunduh, tunggu sebentar...");

  const child = exec(cmd);

  child.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  child.stderr.on("data", (data) => {
    console.error(data.toString());
  });

  child.on("close", (code) => {
    if (code === 0) {
      console.log(`✅ Selesai diunduh! File ada di: ${outputDir}`);
    } else {
      console.log("❌ Terjadi kesalahan saat mengunduh.");
    }
    rl.close();
  });
}

function download() {
  rl.question("Masukkan format yang ingin kamu unduh [mp3/mp4]: ", (format) => {
    rl.question("Masukkan link YouTube: ", (url) => {
      const outputDir = path.resolve("./downloads", format === "mp3" ? "audio" : "video");
      ensureDir(outputDir);

      if (format === "mp3") {
        // Ekstrak audio dengan kualitas terbaik
        const cmd = `yt-dlp -x --audio-format mp3 -o "${outputDir}/%(title)s.%(ext)s" "${url}"`;
        runCommand(cmd, outputDir);

      } else if (format === "mp4") {
        rl.question(
          "Pilih kualitas video [360/480/720/1080/1440/2160/max]: ",
          (quality) => {
            let cmd;
            if (quality === "max") {
              // kualitas terbaik (video + audio), lalu recode ke mp4 (H.264 + AAC)
              cmd = `yt-dlp -f "bv*+ba/b" --recode-video mp4 -o "${outputDir}/%(title)s.%(ext)s" "${url}"`;
            } else {
              // pilih resolusi spesifik lalu recode ke mp4 (H.264 + AAC)
              cmd = `yt-dlp -f "bestvideo[height=${quality}]+bestaudio/best[height=${quality}]" --recode-video mp4 -o "${outputDir}/%(title)s.%(ext)s" "${url}"`;
            }
            runCommand(cmd, outputDir);
          }
        );

      } else {
        console.log("⚠️ Masukkan hanya 'mp3' atau 'mp4'.");
        rl.close();
      }
    });
  });
}

// 🚀 Mulai: cek ffmpeg dulu baru jalan
checkFfmpeg(download);
