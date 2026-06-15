/**
 * Whitelist of fields a user is allowed to change on their own profile.
 * Identity/ownership columns (id, phone, wechatOpenId, status, ...) are
 * intentionally absent so clients cannot overwrite them via PUT /auth/profile.
 */
export class UpdateProfileDTO {
  nickname?: string
  avatarUrl?: string
  bio?: string
  city?: string
  interests?: string[]
}
