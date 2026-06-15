import { Injectable } from '@nestjs/common'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

@Injectable()
export class UploadService {
  private uploadDir: string

  constructor() {
    this.uploadDir = join(process.cwd(), 'uploads')
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    const ext = file.originalname.split('.').pop() || 'jpg'
    const filename = `${randomUUID()}.${ext}`
    const filepath = join(this.uploadDir, filename)
    writeFileSync(filepath, file.buffer)
    return { url: `/uploads/${filename}` }
  }
}
