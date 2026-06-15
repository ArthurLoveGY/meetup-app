import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from './auth.service'
import { JWT_SECRET } from './jwt-secret'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    })
  }

  /**
   * Called on every guarded request. We re-validate that the user still
   * exists and is active so that disabled/deleted users are immediately
   * locked out even before their token's natural expiry.
   */
  async validate(payload: { sub: string }) {
    try {
      const user = await this.authService.validateUser(payload.sub)
      return { id: user.id }
    } catch {
      throw new UnauthorizedException()
    }
  }
}
