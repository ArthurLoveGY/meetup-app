import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateProfileDTO {
  @ApiPropertyOptional({ description: '用户昵称' })
  nickname?: string

  @ApiPropertyOptional({ description: '头像 URL' })
  avatarUrl?: string

  @ApiPropertyOptional({ description: '个人简介' })
  bio?: string

  @ApiPropertyOptional({ description: '所在城市' })
  city?: string

  @ApiPropertyOptional({ description: '兴趣标签', type: [String] })
  interests?: string[]
}
