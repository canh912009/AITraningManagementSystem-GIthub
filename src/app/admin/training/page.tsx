'use client'

import {useState, useEffect, useRef, useCallback} from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    FileAudio,
    Play,
    Pause,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Download,
    Search,
    X
} from 'lucide-react'
import {AudioTrainingFile, CommonFilter, TrainingStatus} from '@/types'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

export default function AdminTrainingPage() {
    const [files, setFiles] = useState<AudioTrainingFile[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<TrainingStatus | CommonFilter>(CommonFilter.ALL)
    const [phoneSearch, setPhoneSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [selectedFiles, setSelectedFiles] = useState<number[]>([])
    const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<AudioTrainingFile | null>(null)
    const [playingFile, setPlayingFile] = useState<number | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [fileToReject, setFileToReject] = useState<number | null>(null)
    const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false)
    const [bulkRejectionReason, setBulkRejectionReason] = useState('')

    // Audio ref for table playback
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Toast hook với helper methods
    const { addToast, success, error: showError, approved, rejected, pending } = useToast()

    // Cleanup audio when component unmounts
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    const fetchTrainingFiles = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '25',
                ...(statusFilter !== CommonFilter.ALL && { status: statusFilter }),
                ...(phoneSearch && { phone: phoneSearch }),
            })

            const response = await fetch(`/api/admin/training-files?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            })
            const data = await response.json()

            if (data.success) {
                setFiles(data.data.files)
                setTotalPages(data.data.pagination.totalPages)
            }
        } catch (error) {
            console.error('Error fetching training files:', error)
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter, phoneSearch])

    useEffect(() => {
        fetchTrainingFiles()
    }, [fetchTrainingFiles])

    const handleSearch = () => {
        setPhoneSearch(searchInput)
        setPage(1)
    }

    const handleClearSearch = () => {
        setSearchInput('')
        setPhoneSearch('')
        setPage(1)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleBulkStatusUpdate = async (status: TrainingStatus, reason?: string) => {
        if (selectedFiles.length === 0) {
            showError('Lỗi', 'Vui lòng chọn ít nhất một file')
            return
        }

        try {
            setBulkUpdateLoading(true)
            const response = await fetch('/api/admin/training-files', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    fileIds: selectedFiles,
                    status,
                    ...(status === TrainingStatus.REJECTED && reason && { rejectionReason: reason })
                })
            })

            const data = await response.json()

            if (data.success) {
                // Sử dụng toast màu sắc theo trạng thái
                if (status === TrainingStatus.APPROVED) {
                    approved('Duyệt thành công', `Đã duyệt ${data.data.count} file`)
                } else if (status === TrainingStatus.REJECTED) {
                    rejected('Từ chối thành công', `Đã từ chối ${data.data.count} file`)
                } else {
                    pending('Cập nhật thành công', `Đã chuyển ${data.data.count} file về chờ duyệt`)
                }

                setSelectedFiles([])
                setShowBulkRejectDialog(false)
                setBulkRejectionReason('')
                fetchTrainingFiles()
            } else {
                showError('Lỗi', data.error || 'Có lỗi xảy ra khi cập nhật')
            }
        } catch (error) {
            console.error('Bulk update error:', error)
            showError('Lỗi', 'Có lỗi xảy ra khi cập nhật')
        } finally {
            setBulkUpdateLoading(false)
        }
    }

    const handleSingleFileStatusUpdate = async (fileId: number, status: TrainingStatus, reason?: string) => {
        try {
            setBulkUpdateLoading(true)
            const response = await fetch('/api/admin/training-files', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    fileIds: [fileId],
                    status,
                    ...(status === TrainingStatus.REJECTED && reason && { rejectionReason: reason })
                })
            })

            const data = await response.json()

            if (data.success) {
                if (status === TrainingStatus.APPROVED) {
                    approved('Duyệt thành công', 'File đã được duyệt')
                } else if (status === TrainingStatus.REJECTED) {
                    rejected('Từ chối thành công', 'File đã bị từ chối')
                } else {
                    pending('Cập nhật thành công', 'File đã chuyển về chờ duyệt')
                }

                fetchTrainingFiles()
                setShowRejectDialog(false)
                setRejectionReason('')
                setFileToReject(null)
            } else {
                showError('Lỗi', data.error || 'Có lỗi xảy ra khi cập nhật')
            }
        } catch (error) {
            console.error('Single file update error:', error)
            showError('Lỗi', 'Có lỗi xảy ra khi cập nhật')
        } finally {
            setBulkUpdateLoading(false)
        }
    }

    const handleFileSelect = (fileId: number) => {
        setSelectedFiles(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        )
    }

    const handleSelectAll = () => {
        if (selectedFiles.length === files.length) {
            setSelectedFiles([])
        } else {
            setSelectedFiles(files.map(f => f.id))
        }
    }

    const getStatusBadge = (status: TrainingStatus) => {
        switch (status) {
            case TrainingStatus.PENDING:
                return <Badge variant="pending">Chờ duyệt</Badge>
            case TrainingStatus.APPROVED:
                return <Badge variant="success">Đã duyệt</Badge>
            case TrainingStatus.REJECTED:
                return <Badge variant="destructive">Từ chối</Badge>
            default:
                return <Badge variant="outline">Không xác định</Badge>
        }
    }

    const toggleAudioPlay = async (fileId: number, filePath: string) => {
        try {
            if (playingFile === fileId) {
                // Pause current audio
                if (audioRef.current) {
                    audioRef.current.pause()
                }
                setPlayingFile(null)
            } else {
                // Stop any current playing audio
                if (audioRef.current) {
                    audioRef.current.pause()
                }

                // Create new audio element
                const audio = new Audio(`/api/uploads/${filePath}`)
                audioRef.current = audio

                // Set up event listeners
                audio.addEventListener('ended', () => {
                    setPlayingFile(null)
                })

                audio.addEventListener('error', (e) => {
                    console.error('Audio error:', e)
                    showError('Lỗi phát nhạc', 'Không thể phát file audio')
                    setPlayingFile(null)
                })

                // Play audio
                await audio.play()
                setPlayingFile(fileId)
            }
        } catch (error) {
            console.error('Error playing audio:', error)
            showError('Lỗi phát nhạc', 'Không thể phát file audio')
            setPlayingFile(null)
        }
    }

    const downloadFilesSelected = async () => {
        if (selectedFiles.length === 0) {
            showError('Lỗi', 'Vui lòng chọn ít nhất một file để tải về')
            return
        }

        try {
            setBulkUpdateLoading(true)
            addToast({
                title: 'Đang chuẩn bị',
                description: `Đang tạo file ZIP cho ${selectedFiles.length} file...`,
                variant: 'default'
            })

            console.log('Downloading files:', selectedFiles) // Debug log

            const response = await fetch('/api/admin/training-files/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    fileIds: selectedFiles
                })
            })

            console.log('Response status:', response.status) // Debug log

            if (!response.ok) {
                const errorData = await response.json()
                console.error('API Error:', errorData) // Debug log
                throw new Error(errorData.error || 'Không thể tải file')
            }

            // Get filename from response header
            const contentDisposition = response.headers.get('content-disposition')
            const filename = contentDisposition 
                ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
                : `training-files-${new Date().toISOString().split('T')[0]}.zip`

            // Download file
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            success('Tải thành công', `Đã tải ${selectedFiles.length} file`)
            setSelectedFiles([]) // Clear selection after download

        } catch (error) {
            console.error('Download error:', error)
            // @ts-ignore
            showError('Lỗi', `Có lỗi xảy ra khi tải file: ${error?.message}`)
        } finally {
            setBulkUpdateLoading(false)
        }
    }

    const handleRejectClick = (fileId: number) => {
        setFileToReject(fileId)
        setShowRejectDialog(true)
    }

    const handleRejectConfirm = () => {
        if (!rejectionReason.trim()) {
            showError('Lỗi', 'Vui lòng nhập lý do từ chối')
            return
        }
        if (fileToReject) {
            handleSingleFileStatusUpdate(fileToReject, TrainingStatus.REJECTED, rejectionReason)
        }
    }

    const handleBulkRejectClick = () => {
        if (selectedFiles.length === 0) {
            showError('Lỗi', 'Vui lòng chọn ít nhất một file')
            return
        }
        setShowBulkRejectDialog(true)
    }

    const handleBulkRejectConfirm = () => {
        if (!bulkRejectionReason.trim()) {
            showError('Lỗi', 'Vui lòng nhập lý do từ chối')
            return
        }
        handleBulkStatusUpdate(TrainingStatus.REJECTED, bulkRejectionReason)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý File Training</h1>
                <Button onClick={downloadFilesSelected} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download file đã chọn
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Search className="w-5 h-5" />
                        <span>Tìm kiếm và bộ lọc</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Current Search Display */}
                        {phoneSearch && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Đang tìm kiếm:</span>
                                <Badge variant="outline" className="px-2 py-1">
                                    {phoneSearch}
                                    <button
                                        onClick={handleClearSearch}
                                        className="ml-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            </div>
                        )}

                        {/* Search, Status Filter and Bulk Actions */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Phone Search */}
                            <div className="relative w-64">
                                <Input
                                    type="text"
                                    placeholder="SĐT..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="pr-8"
                                />
                                {searchInput && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TrainingStatus)}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Lọc theo trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value={TrainingStatus.PENDING}>Chờ duyệt</SelectItem>
                                    <SelectItem value={TrainingStatus.APPROVED}>Đã duyệt</SelectItem>
                                    <SelectItem value={TrainingStatus.REJECTED}>Từ chối</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex-1"></div>

                            <Button onClick={handleSearch} disabled={loading}>
                                <Search className="w-4 h-4 mr-2" />
                                Tìm kiếm
                            </Button>

                            <div className="flex-1"></div>

                            {selectedFiles.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        Đã chọn: {selectedFiles.length}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleBulkStatusUpdate(TrainingStatus.APPROVED)}
                                        disabled={bulkUpdateLoading}
                                        className="text-green-600"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Duyệt
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleBulkRejectClick}
                                        disabled={bulkUpdateLoading}
                                        className="text-red-600"
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Từ chối
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleBulkStatusUpdate(TrainingStatus.PENDING)}
                                        disabled={bulkUpdateLoading}
                                        className="text-yellow-600"
                                    >
                                        <Clock className="w-4 h-4 mr-1" />
                                        Chờ duyệt
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Files Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách file training</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Thêm style cho table để cột File rộng hơn */}
                            <style jsx global>{`
                                .file-column {
                                    min-width: 250px;
                                    max-width: 400px;
                                    white-space: normal;
                                    word-break: break-all;
                                }
                            `}</style>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <input
                                                type="checkbox"
                                                checked={selectedFiles.length === files.length && files.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded"
                                            />
                                        </TableHead>
                                        <TableHead className="w-16">ID</TableHead>
                                        <TableHead className="w-32">SĐT</TableHead>
                                        <TableHead className="w-40">Tên người dùng</TableHead>
                                        <TableHead className="file-column">File</TableHead>
                                        <TableHead className="w-32">Trạng thái</TableHead>
                                        <TableHead className="w-48">Lý do từ chối</TableHead>
                                        <TableHead className="w-32">Ngày tạo</TableHead>
                                        <TableHead className="w-32">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {files.map((file) => (
                                        <TableRow key={file.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFiles.includes(file.id)}
                                                    onChange={() => handleFileSelect(file.id)}
                                                    className="rounded"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{file.id}</TableCell>
                                            <TableCell>{file.user?.phone}</TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {file.user?.name || 'Chưa cập nhật'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <FileAudio className="w-4 h-4 flex-shrink-0" />
                                                    <span className="text-sm break-all">
                                                        {file.filePath.split('/').pop()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(file.trainingStatus)}</TableCell>
                                            <TableCell>
                                                {file.trainingStatus === TrainingStatus.REJECTED && file.rejectionReason ? (
                                                    <div className="max-w-48">
                                                        <p className="text-sm text-red-600 truncate" title={file.rejectionReason}>
                                                            {file.rejectionReason}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(file.createdAt)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => toggleAudioPlay(file.id, file.filePath)}
                                                    >
                                                        {playingFile === file.id ? (
                                                            <Pause className="w-4 h-4" />
                                                        ) : (
                                                            <Play className="w-4 h-4" />
                                                        )}
                                                    </Button>

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setSelectedFile(file)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Chi tiết file training</DialogTitle>
                                                            </DialogHeader>
                                                            {selectedFile && (
                                                                <div className="space-y-4">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="text-sm font-medium">ID:</label>
                                                                            <p className="text-sm text-gray-600">{selectedFile.id}</p>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-sm font-medium">SĐT:</label>
                                                                            <p className="text-sm text-gray-600">{selectedFile.user?.phone}</p>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-sm font-medium">Tên:</label>
                                                                            <p className="text-sm text-gray-600">{selectedFile.user?.name || 'Chưa cập nhật'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-sm font-medium">Trạng thái:</label>
                                                                            <div className="mt-1">{getStatusBadge(selectedFile.trainingStatus)}</div>
                                                                        </div>
                                                                    </div>

                                                                    {selectedFile.trainingStatus === TrainingStatus.REJECTED && selectedFile.rejectionReason && (
                                                                        <div>
                                                                            <label className="text-sm font-medium">Lý do từ chối:</label>
                                                                            <p className="text-sm text-red-600 mt-1 p-2 bg-red-50 rounded border border-red-200">
                                                                                {selectedFile.rejectionReason}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    <div>
                                                                        <label className="text-sm font-medium">File:</label>
                                                                        <p className="text-sm text-gray-600">{selectedFile.filePath}</p>
                                                                    </div>

                                                                    <div>
                                                                        <label className="text-sm font-medium">Nội dung tiếng Việt:</label>
                                                                        <p className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                                                                            {selectedFile.contentVietnamese || 'Không có nội dung'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <label className="text-sm font-medium">Nội dung tiếng Hàn:</label>
                                                                        <p className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                                                                            {selectedFile.contentKorean || 'Không có nội dung'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <label className="text-sm font-medium">Audio Player:</label>
                                                                        <audio
                                                                            controls
                                                                            className="w-full mt-2"
                                                                            src={`/api/uploads/${selectedFile.filePath}`}
                                                                        >
                                                                            Trình duyệt không hỗ trợ audio player
                                                                        </audio>
                                                                    </div>

                                                                    <div className="flex justify-center space-x-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={() => handleSingleFileStatusUpdate(selectedFile.id, TrainingStatus.APPROVED)}
                                                                            disabled={bulkUpdateLoading}
                                                                            className="text-green-600"
                                                                        >
                                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                                            Duyệt
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={() => handleRejectClick(selectedFile.id)}
                                                                            disabled={bulkUpdateLoading}
                                                                            className="text-red-600"
                                                                        >
                                                                            <XCircle className="w-4 h-4 mr-1" />
                                                                            Từ chối
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-gray-500">
                                    Trang {page} / {totalPages}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Trước
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Bulk Rejection Reason Dialog */}
            <Dialog open={showBulkRejectDialog} onOpenChange={setShowBulkRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lý do từ chối hàng loạt</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">
                                Nhập lý do từ chối {selectedFiles.length} file đã chọn:
                            </label>
                            <textarea
                                value={bulkRejectionReason}
                                onChange={(e) => setBulkRejectionReason(e.target.value)}
                                placeholder="Ví dụ: Chất lượng âm thanh kém, nội dung không phù hợp..."
                                className="w-full mt-2 p-3 border rounded-md resize-none"
                                rows={4}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowBulkRejectDialog(false)
                                    setBulkRejectionReason('')
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleBulkRejectConfirm}
                                disabled={bulkUpdateLoading || !bulkRejectionReason.trim()}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Xác nhận từ chối {selectedFiles.length} file
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Single File Rejection Reason Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lý do từ chối</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Nhập lý do từ chối file này:</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Ví dụ: Chất lượng âm thanh kém, nội dung không phù hợp..."
                                className="w-full mt-2 p-3 border rounded-md resize-none"
                                rows={4}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRejectDialog(false)
                                    setRejectionReason('')
                                    setFileToReject(null)
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleRejectConfirm}
                                disabled={bulkUpdateLoading || !rejectionReason.trim()}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Xác nhận từ chối
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
