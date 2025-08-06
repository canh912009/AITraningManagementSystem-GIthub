export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { getUserFromToken, createApiResponse } from '@/lib/auth'
import { generateFileName, ensureUploadDir, validateAudioFile } from '@/lib/utils'
import {TrainingStatus} from "@/types";

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request)

        if (!user) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Unauthorized'),
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const contentVietnamese = formData.get('contentVietnamese') as string
        const contentKorean = formData.get('contentKorean') as string

        if (!file) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'File âm thanh là bắt buộc'),
                { status: 400 }
            )
        }

        // Validate file
        const validation = validateAudioFile(file)
        if (!validation.isValid) {
            return NextResponse.json(
                createApiResponse(false, null, null, validation.error),
                { status: 400 }
            )
        }

        // Get upload directory from environment (should be absolute path)
        const uploadDir = process.env.UPLOAD_DIR
        if (!uploadDir) {
            console.error('UPLOAD_DIR environment variable is not set')
            return NextResponse.json(
                createApiResponse(false, null, null, 'Server configuration error'),
                { status: 500 }
            )
        }

        // Generate file name and path
        const fileName = generateFileName(file.name, user.id)
        const userUploadDir = path.join(uploadDir, user.id.toString())

        await ensureUploadDir(userUploadDir)

        const filePath = path.join(userUploadDir, fileName)
        // Store relative path with forward slashes for web access
        const relativePath = `${user.id}/${fileName}`.replace(/\\/g, '/')

        // Save file
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Save to database
        const audioTrainingFile = await db.audioTrainingFile.create({
            data: {
                userId: user.id,
                filePath: relativePath,
                contentVietnamese: contentVietnamese || null,
                contentKorean: contentKorean || null,
                trainingStatus: TrainingStatus.PENDING,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        phone: true,
                        age: true,
                        gender: true,
                        region: true,
                    }
                }
            }
        })

        return NextResponse.json(
            createApiResponse(true, audioTrainingFile, 'Upload file thành công'),
            { status: 201 }
        )

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}
