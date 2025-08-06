export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { db } from '@/lib/db'
import { getAdminFromToken, createApiResponse } from '@/lib/auth'
import { ensureUploadDir, validateImageFile } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        const admin = await getAdminFromToken(request)

        if (!admin) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Unauthorized'),
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const imageType = formData.get('imageType') as string
        const userId = formData.get('userId') as string

        if (!file) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'File ảnh là bắt buộc'),
                { status: 400 }
            )
        }

        if (!imageType || !['user_image_origin', 'user_image_record'].includes(imageType)) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Loại ảnh không hợp lệ'),
                { status: 400 }
            )
        }

        if (!userId) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'User ID là bắt buộc'),
                { status: 400 }
            )
        }

        // Validate image file
        const validation = validateImageFile(file)
        if (!validation.isValid) {
            return NextResponse.json(
                createApiResponse(false, null, null, validation.error),
                { status: 400 }
            )
        }

        // Check if user exists
        const user = await db.user.findUnique({
            where: { id: parseInt(userId) }
        })

        if (!user) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Người dùng không tồn tại'),
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

        const userUploadDir = path.join(uploadDir, userId)
        await ensureUploadDir(userUploadDir)

        // Get file extension
        const fileExtension = path.extname(file.name)
        const fileName = `${imageType}${fileExtension}`
        const filePath = path.join(userUploadDir, fileName)

        // Delete old image if exists
        if (existsSync(filePath)) {
            try {
                await unlink(filePath)
            } catch (error) {
                console.warn('Could not delete old image:', error)
            }
        }

        // Save new image
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        const relativePath = `${userId}/${fileName}`.replace(/\\/g, '/')

        // Update user record with image path
        const updateData = imageType === 'user_image_origin' 
            ? { userImageOrigin: relativePath }
            : { userImageRecord: relativePath }

        const updatedUser = await db.user.update({
            where: { id: parseInt(userId) },
            data: updateData,
            select: {
                id: true,
                phone: true,
                name: true,
                userImageOrigin: true,
                userImageRecord: true,
            }
        })

        return NextResponse.json(
            createApiResponse(true, {
                user: updatedUser,
                imagePath: relativePath,
                imageType
            }, 'Upload ảnh thành công'),
            { status: 200 }
        )

    } catch (error) {
        console.error('Admin image upload error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}