export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, validatePhoneNumber, createApiResponse } from '@/lib/auth'

interface MultiRegisterUser {
    phone: string
    password: string
    name?: string
    age?: number
    gender?: string
    region?: string
}

interface MultiRegisterRequest {
    users: MultiRegisterUser[]
}

interface MultiRegisterResult {
    index: number
    user?: any
    success: boolean
}

interface MultiRegisterError {
    index: number
    phone: string
    error: string
}

interface MultiRegisterResponse {
    total: number
    success: number
    failed: number
    successUsers: MultiRegisterResult[]
    errors: MultiRegisterError[]
}

export async function POST(request: NextRequest) {
    try {
        const body: MultiRegisterRequest = await request.json()
        const { users } = body

        // Validate input
        if (!users || !Array.isArray(users) || users.length === 0) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Danh sách người dùng không hợp lệ'),
                { status: 400 }
            )
        }

        if (users.length > 100) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Không thể đăng ký quá 100 người dùng cùng lúc'),
                { status: 400 }
            )
        }

        const results: MultiRegisterResult[] = []
        const errors: MultiRegisterError[] = []

        // Process each user
        for (let i = 0; i < users.length; i++) {
            const user = users[i]
            const { phone, password, name, age, gender, region } = user

            try {
                // Basic validation
                if (!phone || !password) {
                    errors.push({
                        index: i,
                        phone: phone || 'N/A',
                        error: 'Số điện thoại và mật khẩu là bắt buộc'
                    })
                    continue
                }

                // Validate phone number
                if (!validatePhoneNumber(phone)) {
                    errors.push({
                        index: i,
                        phone: phone,
                        error: 'Số điện thoại không hợp lệ'
                    })
                    continue
                }

                // Validate password length
                if (password.length < 6) {
                    errors.push({
                        index: i,
                        phone: phone,
                        error: 'Mật khẩu phải có ít nhất 6 ký tự'
                    })
                    continue
                }

                // Validate age if provided
                if (age !== undefined && (age < 1 || age > 100)) {
                    errors.push({
                        index: i,
                        phone: phone,
                        error: 'Tuổi phải từ 1 đến 100'
                    })
                    continue
                }

                // Validate gender if provided
                if (gender && !['M', 'F', 'O'].includes(gender)) {
                    errors.push({
                        index: i,
                        phone: phone,
                        error: 'Giới tính không hợp lệ (M/F/MALE/FEMALE)'
                    })
                    continue
                }

                // Validate region if provided
                if (region && !['N', 'M', 'S'].includes(region)) {
                    errors.push({
                        index: i,
                        phone: phone,
                        error: 'Vùng miền không hợp lệ (N/S/C/BAC/NAM/TRUNG)'
                    })
                    continue
                }

                // Check if user already exists
                const existingUser = await db.user.findUnique({
                    where: { phone }
                })

                if (existingUser) {
                    errors.push({
                        index: i,
                        phone: phone,
                        error: 'Số điện thoại đã được sử dụng'
                    })
                    continue
                }

                // Hash password
                const hashedPassword = await hashPassword(password)

                // Create user
                const newUser = await db.user.create({
                    data: {
                        phone,
                        password: hashedPassword,
                        name: name || null,
                        age: age || null,
                        // @ts-ignore
                        gender: gender || 'O',
                        // @ts-ignore
                        region: region || 'O',
                    },
                    select: {
                        id: true,
                        phone: true,
                        name: true,
                        isAdmin: true,
                        age: true,
                        gender: true,
                        region: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                })

                results.push({
                    index: i,
                    user: newUser,
                    success: true
                })

            } catch (error) {
                console.error(`Error creating user at index ${i}:`, error)
                errors.push({
                    index: i,
                    phone: phone || 'N/A',
                    error: 'Lỗi hệ thống khi tạo người dùng'
                })
            }
        }

        // Create response summary
        const summary: MultiRegisterResponse = {
            total: users.length,
            success: results.length,
            failed: errors.length,
            successUsers: results,
            errors: errors
        }

        // Determine response status and message
        if (errors.length === 0) {
            // All users created successfully
            return NextResponse.json(
                createApiResponse(true, summary, `Đăng ký thành công ${results.length} người dùng`),
                { status: 201 }
            )
        } else if (results.length === 0) {
            // No users created successfully
            return NextResponse.json(
                createApiResponse(false, summary, null, 'Không có người dùng nào được tạo thành công'),
                { status: 400 }
            )
        } else {
            // Partial success
            return NextResponse.json(
                createApiResponse(true, summary, `Đăng ký thành công ${results.length}/${users.length} người dùng. ${errors.length} người dùng thất bại.`),
                { status: 207 } // 207 Multi-Status
            )
        }

    } catch (error) {
        console.error('Multi-registration error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}