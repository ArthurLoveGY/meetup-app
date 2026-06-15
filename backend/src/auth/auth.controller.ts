import { Controller, Post, Body, Get, Put, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { UpdateProfileDTO } from './dto/update-profile.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('wechat-login')
  async wechatLogin(@Body() body: { code: string }) {
    return this.authService.loginWithWechat(body.code)
  }

  @Post('phone-login')
  async phoneLogin(@Body() body: { phone: string; code: string }) {
    return this.authService.loginWithPhone(body.phone, body.code)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id)
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Request() req, @Body() body: UpdateProfileDTO) {
    return this.authService.updateProfile(req.user.id, body)
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  async refresh(@Request() req) {
    const user = await this.authService.getProfile(req.user.id)
    return { user }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout() {
    return { success: true }
  }
}
