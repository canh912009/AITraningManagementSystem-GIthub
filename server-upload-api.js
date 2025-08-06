// File này chạy trên server 192.168.105.17
// Simple Express server để nhận file upload từ máy local

const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3001

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.body.userId || 'unknown'
        const uploadPath = path.join('/home/altimedia/homeAiDataUpload', userId.toString())
        
        // Create directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true })
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    next()
})

app.use(express.json())

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }

        const relativePath = `${req.body.userId}/${req.file.filename}`
        
        res.json({
            success: true,
            filePath: relativePath,
            message: 'File uploaded successfully'
        })
    } catch (error) {
        console.error('Upload error:', error)
        res.status(500).json({ error: 'Upload failed' })
    }
})

// Delete endpoint
app.delete('/delete/:userId/:filename', (req, res) => {
    try {
        const { userId, filename } = req.params
        const filePath = path.join('/home/altimedia/homeAiDataUpload', userId, filename)
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            res.json({ success: true, message: 'File deleted successfully' })
        } else {
            res.status(404).json({ error: 'File not found' })
        }
    } catch (error) {
        console.error('Delete error:', error)
        res.status(500).json({ error: 'Delete failed' })
    }
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Upload server running on http://192.168.105.17:${PORT}`)
})

// Chạy trên server: node server-upload-api.js
