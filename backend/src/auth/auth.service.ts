import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../user/user.entity'

/** In-memory store of phone -> { code, expiresAt }. Replace with Redis in production. */
const smsCodes = new Map<string, { code: string; expiresAt: number }>()
const SMS_TTL_MS = 5 * 60 * 1000 // 5 minutes

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async loginWithWechat(code: string): Promise<{ token: string; user: User }> {
    const openId = 'mock_openid_' + code
    let user = await this.userRepo.findOne({ where: { wechatOpenId: openId } })

    if (!user) {
      user = this.userRepo.create({
        wechatOpenId: openId,
        nickname: '微信用户' + Math.floor(Math.random() * 10000),
        status: 'active',
      })
      await this.userRepo.save(user)
    }

    const token = this.jwtService.sign({ sub: user.id })
    return { token, user }
  }

  /**
   * Send an SMS verification code. In production this would call an SMS
   * provider; here we generate a code, store it, and log it for dev use.
   * The code MUST be verified by loginWithPhone.
   */
  async sendSmsCode(phone: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    smsCodes.set(phone, { code, expiresAt: Date.now() + SMS_TTL_MS })
    // TODO: integrate real SMS gateway. Do not log in production.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[dev] SMS code for ${phone}: ${code}`)
    }
  }

  async loginWithPhone(phone: string, code: string): Promise<{ token: string; user: User }> {
    if (!code) throw new UnauthorizedException('验证码不能为空')
    const stored = smsCodes.get(phone)
    if (!stored || stored.expiresAt < Date.now() || stored.code !== code) {
      throw new UnauthorizedException('验证码无效或已过期')
    }
    // Consume the code so it cannot be reused.
    smsCodes.delete(phone)

    let user = await this.userRepo.findOne({ where: { phone } })

    if (!user) {
      user = this.userRepo.create({
        phone,
        nickname: '用户' + phone.slice(-4),
        status: 'active',
      })
      await this.userRepo.save(user)
    }

    const token = this.jwtService.sign({ sub: user.id })
    return { token, user }
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user || user.status === 'deleted' || user.status === 'disabled') {
      throw new UnauthorizedException()
    }
    return user
  }

  async getProfile(userId: string): Promise<User> {
    return this.userRepo.findOne({ where: { id: userId } })
  }

  /**
   * Only allowlisted fields are applied. Identity/ownership columns
   * (id, phone, wechatOpenId, status, createdAt, ...) are never copied,
   * preventing account takeover via unique-field reassignment.
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const allowed: Array<keyof User> = ['nickname', 'avatarUrl', 'bio', 'city', 'interests']
    const safe: Partial<User> = {}
    for (const key of allowed) {
      if (data[key] !== undefined) {
        ;(safe as Record<string, unknown>)[key] = data[key]
      }
    }
    await this.userRepo.update(userId, safe)
    return this.userRepo.findOne({ where: { id: userId } })
  }
}
