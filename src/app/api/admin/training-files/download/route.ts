import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, existsSync } from 'fs'
import { readdir } from 'fs/promises'
import path from 'path'
import archiver from 'archiver'
import { db } from '@/lib/db'
import { getUserFromToken, createApiResponse } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request)

        if (!user || !user.isAdmin) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Unauthorized'),
                { status: 401 }
            )
        }

        const { fileIds } = await request.json()

        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Danh sách file ID không hợp lệ'),
                { status: 400 }
            )
        }

        // Get files from database
        const files = await db.audioTrainingFile.findMany({
            where: {
                id: {
                    in: fileIds,
                },
            },
            include: {
                user: {
                    select: {
                        phone: true,
                    }
                }
            }
        })

        if (files.length === 0) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Không tìm thấy file nào'),
                { status: 404 }
            )
        }

        const uploadDir = process.env.UPLOAD_DIR
        if (!uploadDir) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Server configuration error'),
                { status: 500 }
            )
        }

        // Create ZIP filename
        const timestamp = new Date().toISOString().split('T')[0]
        const zipFilename = `training-files-${timestamp}.zip`

        // Create ZIP stream
        const archive = archiver('zip', {
            zlib: { level: 9 }
        })

        // Set response headers
        const headers = new Headers({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${zipFilename}"`,
        })

        // Create readable stream for response
        const stream = new ReadableStream({
            start(controller) {
                archive.on('data', (chunk) => {
                    controller.enqueue(new Uint8Array(chunk))
                })

                archive.on('end', () => {
                    controller.close()
                })

                archive.on('error', (err) => {
                    console.error('Archive error:', err)
                    controller.error(err)
                })

                // Add files to archive
                let addedFiles = 0
                files.forEach((file: { filePath: string }) => {
                    const filePath = path.join(uploadDir, file.filePath)
                    
                    if (existsSync(filePath)) {
                        // Extract filename: remove  userId_timestamp_ prefix, keep only the last part
                        const originalName = file.filePath.split('/').pop() || 'unknown'
                        const parts = originalName.split('_')
                        // Remove first 2 parts (userId and timestamp), keep the rest
                        const cleanFilename = parts.length > 2 ? parts.slice(2).join('_') : originalName

                        archive.file(filePath, { name: cleanFilename })
                        addedFiles++
                    }
                })

                if (addedFiles === 0) {
                    controller.error(new Error('Không tìm thấy file nào trên server'))
                    return
                }

                // Finalize archive
                archive.finalize()
            }
        })

        return new Response(stream, { headers })

    } catch (error) {
        console.error('Download files error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}