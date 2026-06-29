import { Controller, Post, Body, Get, Put, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { UpdateProfileDTO } from './dto/update-profile.dto'

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('wechat-login')
  @ApiOperation({ summary: '微信登录' })
  @ApiBody({ schema: { properties: { code: { type: 'string' } }, required: ['code'] } })
  async wechatLogin(@Body() body: { code: string }) {
    return this.authService.loginWithWechat(body.code)
  }

  @Post('phone-login')
  @ApiOperation({ summary: '手机号登录' })
  @ApiBody({ schema: { properties: { phone: { type: 'string' }, code: { type: 'string' } }, required: ['phone', 'code'] } })
  async phoneLogin(@Body() body: { phone: string; code: string }) {
    return this.authService.loginWithPhone(body.phone, body.code)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id)
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新个人资料' })
  async updateProfile(@Request() req, @Body() body: UpdateProfileDTO) {
    return this.authService.updateProfile(req.user.id, body)
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '刷新 Token' })
  async refresh(@Request() req) {
    const user = await this.authService.getProfile(req.user.id)
    return { user }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  async logout() {
    return { success: true }
  }
}
