const fs = require("fs-extra")
const https = require("https")
const http = require("http")
const path = require("path")

const url = process.argv[2]

if (!url) {
  console.log("Missing URL")
  process.exit(1)
}

// Dynamic Theme Name
const domain = new URL(url).hostname.replace("www.", "")
const themeName = `${domain.split(".")[0]}-theme`

const imagesFile = path.join(__dirname, "..", "output", "extracted", "images.json")
const downloadDir = path.join(__dirname, "..", "output", themeName, "assets", "images")

function downloadImage(url, filepath) {

return new Promise((resolve, reject) => {

const protocol = url.startsWith("https") ? https : http
const file = fs.createWriteStream(filepath)

protocol.get(url, (response) => {

if (response.statusCode === 301 || response.statusCode === 302) {

return downloadImage(response.headers.location, filepath)
.then(resolve)
.catch(reject)

}

if (response.statusCode !== 200) {
reject(new Error(`HTTP ${response.statusCode}`))
return
}

response.pipe(file)

file.on("finish", () => {
file.close()
resolve()
})

}).on("error", (err) => {

fs.unlink(filepath, () => {})
reject(err)

})

})

}

async function downloadAllImages() {

console.log("Starting image downloads...\n")
console.log(`[IMAGES] Theme: ${themeName}`)

const data = await fs.readJson(imagesFile)

await fs.ensureDir(downloadDir)

let success = 0
let failed = 0

for (const product of data) {

if (!product.images) continue

for (const imageUrl of product.images) {

try {

const cleanUrl = imageUrl.split("?")[0]
const filename = cleanUrl.split("/").pop()

if (!filename) continue

const filepath = path.join(downloadDir, filename)

await downloadImage(cleanUrl, filepath)

console.log(`✓ Downloaded: ${filename}`)
success++

} catch (err) {

console.log(`✗ Failed: ${imageUrl}`)
failed++

}

await new Promise(r => setTimeout(r, 150))

}

}

console.log("\nDownload complete!")
console.log(`Success: ${success}`)
console.log(`Failed: ${failed}`)

}

downloadAllImages()
